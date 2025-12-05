<template>
  <div>
    <!-- Draggable QR Floating Button -->
    <button
      class="bg-blue-600 text-white w-14  h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition fixed z-110"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="handleClick"
    >
      QR
    </button>

    <!-- QR Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4">
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="scannerOpen = false">&times;</button>
        <div class="relative w-full h-[400px] flex items-center justify-center">
          <qrcode-stream @decode="onDecode" @init="onInit" :camera="{ facingMode: 'environment' }" class="w-full h-full z-10" />
          <div class="qr-frame absolute z-20"></div>
          <div class="scan-line absolute z-30"></div>
        </div>

        <div class="absolute bottom-16 flex flex-col space-y-2 w-64">
          <button @click="openGallery" class="w-full bg-green-500 text-white py-3 rounded">Choose Photo</button>
          <button @click="scannerOpen = false" class="w-full bg-gray-300 text-gray-800 py-3 rounded">Close</button>
        </div>
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleGalleryPhoto" />
      </div>
    </transition>

    <!-- BottomSheet Modal for Confirm Delivery -->
    <transition name="slide-up">
      <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-end justify-center">
        <div class="bg-white w-full p-4 rounded-t-2xl shadow-lg">
          <h2 class="text-lg font-bold mb-2">Confirm Delivery</h2>
          <div class="space-y-2">
            <div><strong>Order No:</strong> {{ scannedOrder.order_no }}</div>
            <div><strong>Customer:</strong> {{ scannedOrder.customer_name }}</div>
            <div><strong>Address:</strong> {{ scannedOrder.address }}</div>
            <div><strong>COD:</strong> ${{ Number(scannedOrder.cod_amount).toFixed(2) }}</div>
          </div>
          <div class="flex space-x-2 mt-4">
            <button @click="confirmDelivery" class="flex-1 bg-green-500 text-white py-2 rounded">Confirm</button>
            <button @click="cancelDelivery" class="flex-1 bg-gray-300 text-black py-2 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Log box for phone -->
    <div class="bg-gray-600" id="log-box" style="position:fixed;bottom:0;left:0;width:100%;height:160px;;color:#0f0;overflow:auto;font-size:12px;z-index:9999;padding:4px;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import API from "@/api";
import jsQR from "jsqr";

export default defineComponent({
  components: { QrcodeStream },
  setup() {
    const scannerOpen = ref(false);
    const showConfirmModal = ref(false);
    const scannedOrder = ref<any>({});

    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 180);
    const rotation = ref(0);
    const dragging = ref(false);
    const moved = ref(false);
    const offset = { x: 0, y: 0 };

    // ------------------------------
    // Logging function for phone
    // ------------------------------
    function log(msg: string) {
      const box = document.getElementById("log-box");
      if (box) {
        const time = new Date().toLocaleTimeString();
        box.innerHTML += `[${time}] ${msg}<br/>`;
        box.scrollTop = box.scrollHeight;
      }
    }

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

    const handleClick = () => { if (!moved.value) scannerOpen.value = true; };

    const galleryInput = ref<HTMLInputElement | null>(null);
    const openGallery = () => galleryInput.value?.click();

    const handleGalleryPhoto = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) onDecode(code.data);
          else log("Failed to decode QR code from image!");
        };
      };
      reader.readAsDataURL(file);
    };

    const camera = { facingMode: "environment" };

    const confirmDelivery = async () => {
      try {
        const response = await API.post('/confirm-delivery', { transaction_id: scannedOrder.value.id });
        if (response.data.success) {
          log("Delivery confirmed!");
          showConfirmModal.value = false;
        }
      } catch (err) {
        log("Failed to confirm delivery: " + err);
      }
    };

    const cancelDelivery = () => { showConfirmModal.value = false; };

    const onInit = (promise: Promise<void>) => {
      promise
        .then(() => {
          const videoEl = document.querySelector("video") as HTMLVideoElement;
          if (videoEl) {
            videoEl.setAttribute("playsinline", "true"); // crucial for mobile
            videoEl.muted = true;
            videoEl.play().catch(err => log("Video play failed: " + err));
            log("Camera initialized successfully");
          }
        })
        .catch(err => log("Camera init error: " + err));
    };

    const onDecode = async (result: string) => {
      log("QR decoded from live camera: " + result);
      scannerOpen.value = false;
      try {
        const response = await API.post('/decrypt-qr', { qr_text: result });
        if (response.data.success) {
          scannedOrder.value = response.data.data;
          showConfirmModal.value = true;
          log("QR data valid: showing confirm modal");
        } else log("Invalid QR code!");
      } catch (err) {
        log("Failed to read QR code: " + err);
      }
    };

    return {
      posX, posY, rotation, startDrag, stopDrag, handleClick,
      scannerOpen, openGallery, galleryInput, handleGalleryPhoto,
      camera, onDecode, onInit,
      showConfirmModal, scannedOrder, confirmDelivery, cancelDelivery
    };
  }
});
</script>

<style scoped>
.qr-frame {
  width: 100%;
  height: 100%;
  border: 2px solid #00ffbb;
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(0, 255, 180, 0.25);
  pointer-events: none;
}

.scan-line {
  width: 100%;
  height: 3px;
  background: rgba(0, 255, 170, 0.9);
  box-shadow: 0 0 8px 2px rgba(0, 255, 170, 0.7);
  animation: scan-move 2s infinite linear, scan-glow 1s infinite alternate;
  pointer-events: none;
}

@keyframes scan-move { 0% { top:0; } 100% { top:100%; } }
@keyframes scan-glow { 0% { opacity:0.5; } 100% { opacity:1; } }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
.slide-up-enter-to, .slide-up-leave-from { transform: translateY(0%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.fade-enter-to, .fade-leave-from { opacity:1; }
</style>
