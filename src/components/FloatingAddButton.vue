<template>
  <div>
    <!-- Floating Scan Button -->
    <button
      class="bg-blue-600 border-4 border-gray-200 text-white w-14 h-14 rounded-full fixed z-40 flex items-center justify-center animate-pulse-border"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }" @mousedown="startDrag"
      @touchstart="startDrag" @click="handleClick">
      <Icon icon="mdi:qrcode-scan" width="28" height="28" />
    </button>

    <!-- Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 p-4">
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="closeScanner">
          &times;
        </button>

        <div id="qr-scanner" ref="scannerContainer"
          class="relative w-full max-w-lg h-[60vh] bg-black rounded-lg overflow-hidden"></div>

        <div class="mt-4 flex space-x-2">
          <button @click="openGallery" class="px-4 py-2 bg-green-500 text-white rounded">
            {{ currentText.selectPhotos }}
          </button>
          <button @click="closeScanner" class="px-4 py-2 bg-gray-300 text-black rounded">
            {{ currentText.close }}
          </button>
          <button @click="toggleList" class="px-4 py-2 bg-blue-500 text-white rounded">
            {{ showList ?  currentText.hide_list : currentText.show_list }}
          </button>
        </div>

        <!-- Scanned QR List -->
        <div v-if="showList" class="mt-4 w-full max-w-lg bg-white rounded p-2 overflow-auto max-h-64">
          <ul>
            <li v-for="(item, index) in scannedList" :key="index" class="border-b py-1 px-2">
              {{ index + 1 }}. {{ currentText.invoice_no + ': ' + item }}
            </li>
          </ul>

          <p class="text-gray-700 text-md font-medium">{{ currentText.total_count }}: {{ scannedList.length || 0 }}</p>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      </div>
    </transition>

    <div id="scanner-temp-file" class="hidden"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, nextTick, computed } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";
import { Icon } from "@iconify/vue";
import { useLangStore } from "@/store/langStore.ts";
import langDataJson from "@/lang.json";
import type { LangData } from "@/types/lang.ts";
import { fetchOrders } from "@/global/useOrder.ts";

const langData = langDataJson as LangData;

interface Html5QrcodeResult {
  decodedText: string;
  decodedResultType: string;
  resultPoints: { x: number; y: number }[];
}

export default defineComponent({
  components: { Icon },

  setup() {
    const langStore = useLangStore();
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);

    // ---------------- SOUND ----------------
    const successSound = new Audio("/sounds/success.wav");
    const errorSound = new Audio("/sounds/error.wav");
    let audioUnlocked = false;

    const unlockAudio = () => {
      if (audioUnlocked) return;
      audioUnlocked = true;
      [successSound, errorSound].forEach(s => { s.volume = 1; s.currentTime = 0; s.play().then(() => s.pause()).catch(() => { }); });
      console.log("AUDIO UNLOCKED ON MOBILE");
    };

    document.addEventListener("pointerdown", unlockAudio, { once: true });
    document.addEventListener("touchstart", unlockAudio, { once: true });
    document.addEventListener("click", unlockAudio, { once: true });

    const playSuccess = () => { if (!audioUnlocked) return; successSound.currentTime = 0; successSound.play().catch(() => { }); }
    const playError = () => { if (!audioUnlocked) return; errorSound.currentTime = 0; errorSound.play().catch(() => { }); }

    // ---------------- UI ----------------
    const scannerOpen = ref(false);
    const scannerContainer = ref<HTMLElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);

    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 80);
    const rotation = ref(0);
    const dragging = ref(false);
    const moved = ref(false);
    const offset = { x: 0, y: 0 };

    // ---------------- QR ----------------
    let html5Qr: Html5Qrcode | null = null;
    let currentCameraId = "";
    let lastScanTime = 0;

    // ---------------- Scanned List ----------------
    const scannedList = ref<string[]>([]);
    const showList = ref(true);
    const toggleList = () => { showList.value = !showList.value; }

    // ---------------- DRAG ----------------
    const startDrag = (e: any) => {
      moved.value = false;
      dragging.value = true;
      const p = e.touches ? e.touches[0] : e;
      offset.x = p.clientX - posX.value;
      offset.y = p.clientY - posY.value;
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", drag);
      window.addEventListener("touchend", stopDrag);
    };
    const drag = (e: any) => {
      if (!dragging.value) return;
      moved.value = true;
      const p = e.touches ? e.touches[0] : e;
      posX.value = Math.max(0, Math.min(p.clientX - offset.x, window.innerWidth - 56));
      posY.value = Math.max(0, Math.min(p.clientY - offset.y, window.innerHeight - 56));
      rotation.value += 4;
    };
    const stopDrag = () => {
      dragging.value = false;
      rotation.value = 0;
      posX.value = window.innerWidth / 2 - 28;
      posY.value = window.innerHeight - 80;
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", drag);
      window.removeEventListener("touchend", stopDrag);
    };
    const handleClick = () => { if (!audioUnlocked) return; if (!moved.value) openScanner(); }

    // ---------------- OPEN/CLOSE SCANNER ----------------
    const openScanner = async () => { scannerOpen.value = true; await nextTick(); await startCameraScanner(); }
    const closeScanner = async () => { scannerOpen.value = false; await stopCameraScanner(); }

    // ---------------- CAMERA ----------------
    async function startCameraScanner() {
      if (!scannerContainer.value) return;
      if (!html5Qr) html5Qr = new Html5Qrcode("qr-scanner");
      const cams = await Html5Qrcode.getCameras();
      const back = cams.find(c => /back|rear|environment/i.test(c.label)) || cams[0];
      currentCameraId = back?.id ?? "";
      try {
        await html5Qr.start(
          { deviceId: { exact: currentCameraId } },
          { fps: 25, qrbox: { width: 180, height: 180 }, disableFlip: false },
          handleDecoded,
          () => { }
        );
      } catch (e) { console.error("Camera start failed:", e); }
    }

    async function stopCameraScanner() {
      if (html5Qr && (html5Qr as any).isScanning) await html5Qr.stop();
    }

    // ---------------- HANDLE SCAN ----------------
    async function handleDecoded(qr: string) {
      const now = Date.now();
      if (now - lastScanTime < 2000) return; // 2s cooldown
      lastScanTime = now;

      try {
        const resp = await API.post("/decrypt-qr", { qr_text: qr });
        if (!resp.data.success) { playError(); showAlert({ type: "error", messageKey: resp.data.msg || "Invalid QR" }); return; }
        const order = resp.data.data;
        const confirm = await API.post("/confirm-delivery", { transaction_id: order.order_no ?? order.id });
        if (confirm.data.success) {
          playSuccess();
          scannedList.value.unshift(order.order_no);
          await fetchOrders();
        }
        // add to list
        else { playError(); showAlert({ type: "error", messageKey: confirm.data.msg || "Confirm failed" }); }
      } catch (e) {
        console.log("catch:", e);
        playError();
        showAlert({ type: "error", messageKey: "Server error" });
      }
    }

    // ---------------- GALLERY ----------------
    const openGallery = () => fileInput.value?.click();
    const handleFile = async (e: any) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!html5Qr) html5Qr = new Html5Qrcode("scanner-temp-file");
      try {
        const result: Html5QrcodeResult = await (html5Qr as any).scanFileV2(f, true);
        const qrText = result?.decodedText;
        if (qrText) handleDecoded(qrText); else playError();
      } catch { playError(); }
      if (fileInput.value) fileInput.value.value = "";
    };

    onBeforeUnmount(() => { try { stopCameraScanner(); } catch { } try { html5Qr?.clear(); } catch { } });

    return {
      scannerOpen, scannerContainer, fileInput,
      posX, posY, rotation,
      startDrag, stopDrag, handleClick,
      openScanner, closeScanner, openGallery, currentText, handleFile,
      scannedList, showList, toggleList
    };
  },
});
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse-border {

  0%,
  100% {
    border-color: #3b82f6;
  }

  50% {
    border-color: #60a5fa;
  }
}

.animate-pulse-border {
  animation: pulse-border 1.5s infinite ease-in-out;
}
</style>
