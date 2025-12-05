<template>
  <div>
    <!-- Floating button -->
    <button class="bg-blue-600 text-white w-14 h-14 rounded-full fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }" @mousedown="startDrag"
      @touchstart="startDrag" @click="handleClick">
      QR
    </button>

    <!-- Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 p-4">
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="closeScanner">&times;</button>

        <!-- Scanner container (html5-qrcode will use this element) -->
        <div ref="scannerContainer" class="relative w-full max-w-lg h-[60vh] bg-black rounded-lg overflow-hidden"></div>

        <div class="mt-4 flex space-x-2">
          <button @click="openGallery" class="px-4 py-2 bg-green-500 text-white rounded">Choose Photo</button>
          <button @click="closeScanner" class="px-4 py-2 bg-gray-300 text-black rounded">Close</button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
      </div>
    </transition>

    <!-- Confirm modal -->
    <transition name="slide-up">
      <div v-if="showConfirmModal" class="fixed inset-0 z-60 flex items-end justify-center">
        <div class="bg-white w-full p-4 rounded-t-2xl shadow-lg">
          <h2 class="text-lg font-bold mb-2">Confirm Delivery</h2>
          <div class="space-y-2">
            <div><strong>Order No:</strong> {{ scannedOrder.order_no ?? scannedOrder.transaction_id }}</div>
            <div><strong>Customer:</strong> {{ scannedOrder.customer_name }}</div>
            <div><strong>Address:</strong> {{ scannedOrder.address }}</div>
            <div><strong>COD:</strong> {{ scannedOrder.cod_amount }}</div>
          </div>
          <div class="flex space-x-2 mt-4">
            <button @click="confirmDelivery" class="flex-1 bg-green-500 text-white py-2 rounded">Confirm</button>
            <button @click="cancelDelivery" class="flex-1 bg-gray-300 text-black py-2 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- On-phone log box -->
    <div id="log-box"
      class="fixed bottom-0 left-0 w-full max-h-40 bg-[#111] text-[#0f0] text-xs overflow-auto z-70 p-2"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from "vue";
import { Html5Qrcode } from "html5-qrcode"; // html5-qrcode package
import API from "@/api"; // adapt to your API instance

export default defineComponent({
  setup() {
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

    // ---------------- logging to visible box on phone ----------------
    function log(msg: string) {
      const box = document.getElementById("log-box");
      if (!box) return;
      const t = new Date().toLocaleTimeString();
      box.innerHTML += `[${t}] ${msg}<br/>`;
      box.scrollTop = box.scrollHeight;
    }

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
      await startCameraScanner();
    }

    async function closeScanner() {
      scannerOpen.value = false;
      await stopCameraScanner();
    }

    async function startCameraScanner() {
      try {
        if (!scannerContainer.value) {
          log("No scanner container element.");
          return;
        }
        // create instance if not exists
        if (!html5Qr) {
          html5Qr = new Html5Qrcode(/* element id or */ scannerContainer.value.id || "scanner-temp");
        }

        // list cameras to pick rear camera if possible
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // prefer environment/back camera
          const back = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
          currentCameraId = back?.id ?? null;
        } else {
          currentCameraId = undefined as any;
        }

        // start scanning with config
        const config = {
          fps: 10,
          qrbox: { width: 300, height: 300 }, // smaller box helps on mobile
          rememberLastUsedCamera: true,
        };

        log("Starting camera scanner...");
        await html5Qr.start(
          currentCameraId ?? { facingMode: "environment" } as any,
          config,
          (decodedText: string) => {
            // success callback
            log("Decoded: " + decodedText);
            // stop immediately to avoid duplicate reads
            stopCameraScanner();
            handleDecoded(decodedText);
          },
          (errorMsg: string) => {
            // scan failure per frame (ignore noisy)
            // you can log if needed: log("Scan frame no result");
          }
        );
        log("Camera started. Point to QR.");
      } catch (err: any) {
        log("Camera start error: " + err?.message) ?? err;
        // fallback: allow the user to choose an image
      }
    }

    async function stopCameraScanner() {
      try {
        if (html5Qr && html5Qr.isScanning) {
          await html5Qr.stop();
          log("Camera scanner stopped.");
        }
      } catch (err) {
        log("Stop scanner error: " + (err instanceof Error ? err.message : err));
      }
    }

    async function handleDecoded(result: string) {
      // call backend /decrypt-qr
      try {
        log("Sending to server for decrypt...");
        const resp = await API.post("/decrypt-qr", { qr_text: result });
        if (resp.data && resp.data.success) {
          scannedOrder.value = resp.data.data;
          showConfirmModal.value = true;
          log("QR valid: showing confirm modal.");
        } else {
          log("Server says invalid QR.");
          alert("Invalid QR code");
        }
      } catch (err: any) {
        log("Decrypt API error: " + (err?.message ?? err));
        alert("Server error while decrypting QR");
      }
    }

    // ---------------- image file fallback ----------------
    const openGallery = () => { fileInput.value?.click(); };

    const handleFile = async (ev: Event) => {
      const f = (ev.target as HTMLInputElement).files?.[0];
      if (!f) return;
      log("File chosen: " + f.name);

      try {
        // html5-qrcode supports scanning file directly (scanFileV2)
        if (!html5Qr) html5Qr = new Html5Qrcode("scanner-temp-file");
        // scanFileV2 returns Promise<string> when success
        // We pass the file object
        log("Decoding image file...");
        // @ts-ignore may not have types for scanFileV2 in installed types
        const decoded = await (html5Qr as any).scanFileV2(f, true);
        if (decoded) {
          log("File decoded: " + decoded);
          handleDecoded(decoded);
        } else {
          log("File decode returned null.");
          alert("Cannot decode QR from this image");
        }
      } catch (err) {
        log("File decode error: " + err);
        alert("Failed to decode image");
      } finally {
        // clear input for reuse
        if (fileInput.value) fileInput.value.value = "";
      }
    };

    // ---------------- confirm/cancel ----------------
    const confirmDelivery = async () => {
      try {
        const response = await API.post("/confirm-delivery", { transaction_id: scannedOrder.value.transaction_id ?? scannedOrder.value.id });
        if (response.data.success) {
          log("Delivery confirmed (server).");
          showConfirmModal.value = false;
        } else {
          log("Confirm delivery failed: " + JSON.stringify(response.data));
          alert("Confirm failed");
        }
      } catch (err) {
        log("Confirm API error: " + err);
        alert("Confirm error");
      }
    };

    const cancelDelivery = () => {
      showConfirmModal.value = false;
    };

    // clean up camera if component unmounts
    onBeforeUnmount(async () => {
      try { await stopCameraScanner(); } catch (e) { }
      if (html5Qr) {
        try { html5Qr.clear(); } catch (e) { }
        html5Qr = null;
      }
    });

    return {
      // UI state & refs
      scannerOpen, showConfirmModal, scannedOrder,
      scannerContainer, fileInput,
      posX, posY, rotation, startDrag, stopDrag, handleClick,
      openGallery, handleFile, camera: { facingMode: "environment" },
      confirmDelivery, cancelDelivery, closeScanner,
      onInit: () => { }, // not used here but kept for compatibility
      // expose log helper if needed
      log,
    };
  },
});
</script>

<style scoped>
/* keep your visual style; this is minimal */
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
</style>
