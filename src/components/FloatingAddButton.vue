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
            Choose Photo
          </button>
          <button @click="closeScanner" class="px-4 py-2 bg-gray-300 text-black rounded">
            Close
          </button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      </div>
    </transition>

    <div id="scanner-temp-file" class="hidden"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, nextTick } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";
import { Icon } from "@iconify/vue";

export default defineComponent({
  components: { Icon },

  setup() {
    // ---------------- SOUND (UNLOCKED AFTER FIRST TOUCH) ----------------
    const successSound = new Audio("/sounds/success.ogg");
    const errorSound = new Audio("/sounds/error.ogg");

    // must unlock audio on first gesture
    // ---- TRUE MOBILE AUDIO UNLOCK ----
    const unlockAudio = () => {
      const sounds = [successSound, errorSound];

      sounds.forEach(s => {
        s.volume = 0;     // silent
        s.play()
          .then(() => s.pause())
          .catch(() => { });
        s.currentTime = 0;
      });

      setTimeout(() => {
        sounds.forEach(s => (s.volume = 1));
      }, 200);

      document.removeEventListener("pointerdown", unlockAudio);
    };

    // IMPORTANT: pointerdown works on ALL phones
    document.addEventListener("pointerdown", unlockAudio, { once: true });


    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    const playSuccess = () => {
      successSound.currentTime = 0;
      successSound.play().catch(() => { });
    };

    const playError = () => {
      errorSound.currentTime = 0;
      errorSound.play().catch(() => { });
    };

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

    let lastScanned = "";
    let lastScanTime = 0;

    // ---------------- DRAGGING ----------------
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

    const handleClick = () => {
      if (!moved.value) openScanner();
    };

    // ---------------- OPEN SCANNER ----------------
    const openScanner = async () => {
      scannerOpen.value = true;
      await nextTick();
      await startCameraScanner();
    };

    const closeScanner = async () => {
      scannerOpen.value = false;
      await stopCameraScanner();
    };

    // ---------------- START CAMERA ----------------
    async function startCameraScanner() {
      if (!scannerContainer.value) return;

      if (!html5Qr) {
        html5Qr = new Html5Qrcode("qr-scanner");
      }

      const cams = await Html5Qrcode.getCameras();
      const back = cams.find(c => /back|rear|environment/i.test(c.label)) || cams[0];
      currentCameraId = back?.id ?? "";

      const config = {
        fps: 25,
        qrbox: { width: 180, height: 180 },
        disableFlip: false,
        useBarCodeDetectorIfSupported: true,
      };

      try {
        await html5Qr.start(
          { deviceId: { exact: currentCameraId } }, // FIXED TYPE
          config,
          handleDecoded,
          () => { }
        );
      } catch (e) {
        console.error("Camera start failed:", e);
      }
    }

    async function stopCameraScanner() {
      if (html5Qr && (html5Qr as any).isScanning) {
        await html5Qr.stop();
      }
    }

    // ---------------- HANDLE SCAN ----------------
    async function handleDecoded(qr: string) {
      const now = Date.now();
      if (qr === lastScanned && now - lastScanTime < 1000) return;

      lastScanned = qr;
      lastScanTime = now;

      try {
        const resp = await API.post("/decrypt-qr", { qr_text: qr });

        if (!resp.data.success) {
          playError();
          showAlert({ type: "error", messageKey: resp.data.msg || "Invalid QR" });
          return;
        }

        const order = resp.data.data;

        const confirm = await API.post("/confirm-delivery", {
          transaction_id: order.transaction_id ?? order.id,
        });

        if (confirm.data.success) {
          playSuccess();
        } else {
          playError();
          showAlert({ type: "error", messageKey: confirm.data.msg || "Confirm failed" });
        }
      } catch {
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
        const result = await (html5Qr as any).scanFileV2(f, true);
        const text = typeof result === "string" ? result : result?.decodedText;
        text ? handleDecoded(text) : playError();
      } catch {
        playError();
      }

      if (fileInput.value) fileInput.value.value = "";
    };

    // ---------------- CLEANUP ----------------
    onBeforeUnmount(() => {
      try { stopCameraScanner(); } catch { }
      try { html5Qr?.clear(); } catch { }
    });

    return {
      scannerOpen,
      scannerContainer,
      fileInput,
      posX,
      posY,
      rotation,
      startDrag,
      stopDrag,
      handleClick,
      openScanner,
      closeScanner,
      openGallery,
      handleFile,
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
