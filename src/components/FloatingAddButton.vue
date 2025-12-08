<template>
  <div>
    <!-- Floating Scan Button -->
    <button
      class="bg-blue-600 border-4 border-gray-200 text-white w-14 h-14 rounded-full fixed z-40 flex items-center justify-center animate-pulse-border"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }"
      @mousedown="startDrag" @touchstart="startDrag" @click="handleClick"
    >
      <Icon icon="mdi:qrcode-scan" width="28" height="28" />
    </button>

    <!-- Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 p-4">

        <button class="absolute top-4 right-4 text-white text-3xl font-bold"
          @click="closeScanner">&times;</button>

        <div id="qr-scanner" ref="scannerContainer"
          class="relative w-full max-w-lg h-[60vh] bg-black rounded-lg overflow-hidden"></div>

        <div class="mt-4 flex space-x-2">
          <button @click="openGallery" class="px-4 py-2 bg-green-500 text-white rounded">Choose Photo</button>
          <button @click="closeScanner" class="px-4 py-2 bg-gray-300 text-black rounded">Close</button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      </div>
    </transition>

    <!-- Hidden for scanFileV2 -->
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

    // ---------------- SOUND EFFECTS ----------------
    const successSound = new Audio("/sounds/success.ogg");
    const errorSound = new Audio("/sounds/error.ogg");

    // ---------------- UI STATE ----------------
    const scannerOpen = ref(false);
    const scannerContainer = ref<HTMLElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);

    // Floating draggable button
    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 80);
    const rotation = ref(0);
    const dragging = ref(false);
    const moved = ref(false);
    const offset = { x: 0, y: 0 };

    // ---------------- QR SCANNER ----------------
    let html5Qr: Html5Qrcode | null = null;
    let currentCameraId: string | null = null;

    let lastScanned = "";
    let lastScanTime = 0;

    // ---------------- DRAG EVENTS ----------------
    const startDrag = (e: MouseEvent | TouchEvent) => {
      moved.value = false;
      dragging.value = true;

      let clientX = 0, clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches?.[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      offset.x = clientX - posX.value;
      offset.y = clientY - posY.value;

      const dragHandler = (ev: any) => drag(ev);
      const stopHandler = () => stopDrag();

      if (e instanceof MouseEvent) {
        window.addEventListener("mousemove", dragHandler);
        window.addEventListener("mouseup", stopHandler);
      } else {
        window.addEventListener("touchmove", dragHandler);
        window.addEventListener("touchend", stopHandler);
      }
    };

    const drag = (e: MouseEvent | TouchEvent) => {
      if (!dragging.value) return;
      moved.value = true;

      let clientX = 0, clientY = 0;
      if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
      else if (e.touches?.[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }

      posX.value = Math.max(0, Math.min(clientX - offset.x, window.innerWidth - 56));
      posY.value = Math.max(0, Math.min(clientY - offset.y, window.innerHeight - 56));
      rotation.value += 5;
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

    // ---------------- OPEN/CLOSE SCANNER ----------------
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

      if (!html5Qr) html5Qr = new Html5Qrcode("qr-scanner");

      const devices = await Html5Qrcode.getCameras();
      const backCam = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
      currentCameraId = backCam?.id ?? null;

      const config = {
        fps: 25,
        qrbox: { width: 180, height: 180 },
        disableFlip: false,
        useBarCodeDetectorIfSupported: true
      };

      const camConfig = currentCameraId
        ? { deviceId: currentCameraId }
        : { facingMode: "environment" };

      try {
        await html5Qr.start(
          camConfig,
          config,
          (decodedText) => handleDecoded(decodedText),  // KEEP CAMERA RUNNING
          () => {}
        );
      } catch (err) {
        console.error("Camera start failed", err);
      }
    }

    async function stopCameraScanner() {
      if (html5Qr && (html5Qr as any).isScanning) {
        await html5Qr.stop();
      }
    }

    // ---------------- SUPER FAST MULTI-SCAN HANDLER ----------------
    async function handleDecoded(result: string) {
      const now = Date.now();

      // Ignore duplicate scan within 1 second
      if (result === lastScanned && now - lastScanTime < 1000) return;

      lastScanned = result;
      lastScanTime = now;

      try {
        const resp = await API.post("/decrypt-qr", { qr_text: result });

        if (resp.data?.success) {
          const order = resp.data.data;

          // confirm delivery immediately
          const confirm = await API.post("/confirm-delivery", {
            transaction_id: order.transaction_id ?? order.id
          });

          if (confirm.data.success) {
            successSound.play();
          } else {
            errorSound.play();
            showAlert({
              type: "error",
              messageKey: confirm.data.msg || "Confirm failed"
            });
          }

        } else {
          errorSound.play();
          showAlert({ type: "error", messageKey: resp.data.msg || "Invalid QR" });
        }

      } catch {
        errorSound.play();
        showAlert({ type: "error", messageKey: "Server error" });
      }
    }

    // ---------------- GALLERY UPLOAD ----------------
    const openGallery = () => fileInput.value?.click();

    const handleFile = async (ev: Event) => {
      const f = (ev.target as HTMLInputElement).files?.[0];
      if (!f) return;

      if (!html5Qr) html5Qr = new Html5Qrcode("scanner-temp-file");

      try {
        const decoded = await (html5Qr as any).scanFileV2(f, true);
        const text = typeof decoded === "string"
          ? decoded
          : decoded?.decodedText ?? "";

        if (text) handleDecoded(text);
        else errorSound.play();

      } catch {
        errorSound.play();
      }

      if (fileInput.value) fileInput.value.value = "";
    };

    // ---------------- UNMOUNT CLEANUP ----------------
    onBeforeUnmount(async () => {
      try { await stopCameraScanner(); } catch {}
      try { await html5Qr?.clear(); } catch {}
      html5Qr = null;
    });

    return {
      scannerOpen,
      scannerContainer,
      fileInput,
      posX, posY, rotation,
      startDrag, stopDrag, handleClick,
      openScanner, closeScanner,
      openGallery, handleFile,
    };
  },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes pulse-border {
  0%, 100% { border-color: #3b82f6; }
  50% { border-color: #60a5fa; }
}
.animate-pulse-border {
  animation: pulse-border 1.5s infinite ease-in-out;
}
</style>
