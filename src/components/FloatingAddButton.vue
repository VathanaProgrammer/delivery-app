<template>
  <div>
    <!-- Floating button -->
    <button class="bg-blue-600 text-white w-14 h-14 rounded-full fixed z-40"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }" @mousedown="startDrag"
      @touchstart="startDrag" @click="handleClick">
      QR
    </button>

    <!-- Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 p-4">
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="closeScanner">&times;</button>

        <!-- Scanner container (html5-qrcode will use this element) -->
        <div id="qr-scanner" ref="scannerContainer"
          class="relative w-full max-w-lg flex-1 bg-transparent rounded-lg overflow-hidden"></div>

        <div class="mt-4 flex space-x-2">
          <button @click="openGallery" class="px-4 py-2 bg-green-500 text-white rounded">Choose Photo</button>
          <button @click="closeScanner" class="px-4 py-2 bg-gray-300 text-black rounded">Close</button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      </div>
    </transition>

    <!-- Confirm Delivery Modal -->
    <ConfirmDeliveryModal v-model:visible="showConfirmModal" :order="scannedOrder" @confirm="confirmDelivery" />

    <!-- Hidden div used by scanFileV2 fallback -->
    <div id="scanner-temp-file" class="hidden"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { nextTick } from "vue";
import BottomSheet from "./BottomSheet.vue";
import ConfirmDeliveryModal from "./ConfirmDeliveryModal.vue";
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";
import { useOrder } from "@/global/useOrder.ts";

export default defineComponent({
  components: { BottomSheet, ConfirmDeliveryModal },
  setup(props, { emit }) {
    const { fetchOrders, orders } = useOrder();
    const scannerOpen = ref(false);
    const showConfirmModal = ref(false);
    const scannedOrder = ref<any>({});
    const scannerContainer = ref<HTMLElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);

    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 80);
    const rotation = ref(0);
    const dragging = ref(false);
    const moved = ref(false);
    const offset = { x: 0, y: 0 };

    let html5Qr: Html5Qrcode | null = null;
    let currentCameraId: string | null = null;

    // --------------- drag handlers for floating button --------------
    const startDrag = (e: MouseEvent | TouchEvent) => {
      moved.value = false;
      dragging.value = true;
      let clientX = 0, clientY = 0;
      if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
      else if (e instanceof TouchEvent && e.touches[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
      offset.x = clientX - posX.value;
      offset.y = clientY - posY.value;
      if (e instanceof MouseEvent) {
        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", stopDrag);
      } else {
        window.addEventListener("touchmove", drag);
        window.addEventListener("touchend", stopDrag);
      }
    };

    const drag = (e: MouseEvent | TouchEvent) => {
      if (!dragging.value) return;
      moved.value = true;
      let clientX = 0, clientY = 0;
      if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
      else if (e instanceof TouchEvent && e.touches[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
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

    const handleClick = () => { if (!moved.value) openScanner(); };

    // ---------------- scanner lifecycle ----------------
    async function openScanner() {
      scannerOpen.value = true;
      await nextTick();
      await startCameraScanner();
    }

    async function closeScanner() {
      scannerOpen.value = false;
      await stopCameraScanner();
    }

    async function startCameraScanner() {
      if (!scannerContainer.value) return;
      if (!html5Qr) html5Qr = new Html5Qrcode("qr-scanner");

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      const backCamera = devices?.find(d => /back|rear|environment/i.test(d.label)) || devices?.[0];
      currentCameraId = backCamera?.id ?? null;

      // QR scanner config
      const config = {
        fps: 25,
        qrbox: { width: 180, height: 180 }, // small scan area
        disableFlip: false,
        useBarCodeDetectorIfSupported: true
      };

      try {
        const constraints: MediaStreamConstraints = currentCameraId
          ? { video: { deviceId: { exact: currentCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } } }
          : { video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const tracks = stream.getVideoTracks();

        if (tracks.length > 0) {
          const track = tracks[0];
          if (track) {
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & { zoom?: number };
            if (capabilities.zoom && typeof capabilities.zoom === "number") {
              const maxZoom = capabilities.zoom;
              // Cast to 'any' to bypass TypeScript check
              await track.applyConstraints({ advanced: [{ zoom: maxZoom }] } as any);
            }

          }
        }

        // Start html5-qrcode with safe deviceId
        await html5Qr.start(
          currentCameraId ? { deviceId: currentCameraId } : { facingMode: "environment" },
          config,
          (decodedText: string) => {
            stopCameraScanner();
            handleDecoded(decodedText);
          },
          (_errorMessage: string) => { /* ignore scan errors */ }
        );
      } catch (err) {
        console.error("Camera start failed:", err);
      }
    }

    async function stopCameraScanner() {
      if (html5Qr && (html5Qr as any).isScanning) {
        await html5Qr.stop();
      }
    }

    async function handleDecoded(result: string) {
      try {
        const resp = await API.post("/decrypt-qr", { qr_text: result });
        if (resp.data?.success) {
          scannedOrder.value = resp.data.data;
          showConfirmModal.value = true;

          scannerOpen.value = false;
          await stopCameraScanner();
        } else {
          showAlert({
            type: "error",
            messageKey: resp.data.msg || 'Invalid QR!'
          })
        }
      } catch {
        showAlert({
          type: 'error',
          messageKey: 'Server error while decrypting QR'
        });
      }
    }

    const openGallery = () => { fileInput.value?.click(); };

    const handleFile = async (ev: Event) => {
      const f = (ev.target as HTMLInputElement).files?.[0];
      if (!f) return;

      if (!html5Qr) html5Qr = new Html5Qrcode("scanner-temp-file");
      try {
        const decoded = await (html5Qr as any).scanFileV2(f, true);
        if (decoded) {
          const text = typeof decoded === "string" ? decoded : decoded?.decodedText ?? JSON.stringify(decoded);
          handleDecoded(text);
        } else {
          alert("Cannot decode QR from this image");
        }
      } catch {
        alert("Failed to decode image");
      } finally {
        if (fileInput.value) fileInput.value.value = "";
      }
    };
    const confirmDelivery = async () => {
      try {
        const response = await API.post("/confirm-delivery", {
          transaction_id: scannedOrder.value.transaction_id ?? scannedOrder.value.id
        });

        if (response.data.success) {
          showConfirmModal.value = false;    // close modal
          scannedOrder.value = {};            // reset scanned order

        } else {
          alert("Confirm failed");
        }
      } catch {
        alert("Confirm error");
      }
    };

    const cancelDelivery = () => { showConfirmModal.value = false; };

    onBeforeUnmount(async () => {
      try { await stopCameraScanner(); } catch { }
      if (html5Qr) {
        try { await (html5Qr.clear()); } catch { }
        html5Qr = null;
      }
    });

    return {
      scannerOpen, showConfirmModal, scannedOrder,
      scannerContainer, fileInput,
      posX, posY, rotation, startDrag, stopDrag, handleClick,
      openGallery, handleFile, camera: { facingMode: "environment" },
      confirmDelivery, cancelDelivery, closeScanner,
      onInit: () => { },
    };
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform .25s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
#qr-scanner {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  background: transparent; /* container */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

#qr-scanner canvas,
#qr-scanner video {
  object-fit: contain;   /* scale video without stretching */
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;  /* remove black bars */
}


</style>
