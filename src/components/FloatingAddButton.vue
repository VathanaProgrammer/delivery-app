<template>
  <div>
    <button
      class="bg-blue-600 text-white w-14 h-14 rounded-full fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px' }"
      @click="scannerOpen = true"
    >QR</button>

    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4">
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="stopScan">&times;</button>
        <video ref="video" autoplay playsinline class="w-64 h-64 rounded-lg"></video>
        <button @click="openGallery" class="mt-4 w-64 bg-green-500 text-white py-3 rounded">Choose Photo</button>
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleGalleryPhoto" />
      </div>
    </transition>

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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import jsQR from "jsqr";
import API from "@/api";

export default defineComponent({
  setup() {
    const scannerOpen = ref(false);
    const showConfirmModal = ref(false);
    const scannedOrder = ref<any>({});
    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 80);
    const video = ref<HTMLVideoElement | null>(null);
    const galleryInput = ref<HTMLInputElement | null>(null);
    let scanning = false;

    const startScan = async () => {
      if (!video.value) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.value.srcObject = stream;
      scanning = true;
      requestAnimationFrame(scanFrame);
    };

    const scanFrame = () => {
      if (!scanning || !video.value) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.value.videoWidth;
      canvas.height = video.value.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video.value, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        scanning = false;
        stopScan();
        onDecode(code.data);
        return;
      }
      requestAnimationFrame(scanFrame);
    };

    const stopScan = () => {
      scannerOpen.value = false;
      scanning = false;
      if (video.value && video.value.srcObject) {
        (video.value.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        video.value.srcObject = null;
      }
    };

    const openGallery = () => galleryInput.value?.click();
    const handleGalleryPhoto = (e: Event) => {
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
          else alert("Failed to decode QR code!");
        };
      };
      reader.readAsDataURL(file);
    };

    const onDecode = async (result: string) => {
      try {
        const response = await API.post('/decrypt-qr', { qr_text: result });
        if (response.data.success) {
          scannedOrder.value = response.data.data;
          showConfirmModal.value = true;
        } else alert('Invalid QR code!');
      } catch {
        alert('Failed to read QR code.');
      }
    };

    const confirmDelivery = async () => {
      try {
        const response = await API.post('/confirm-delivery', { transaction_id: scannedOrder.value.id });
        if (response.data.success) {
          alert("Delivery confirmed!");
          showConfirmModal.value = false;
        }
      } catch {
        alert("Failed to confirm delivery.");
      }
    };

    const cancelDelivery = () => showConfirmModal.value = false;

    return {
      posX, posY, scannerOpen, video, galleryInput, startScan,
      stopScan, openGallery, handleGalleryPhoto,
      showConfirmModal, scannedOrder, confirmDelivery, cancelDelivery
    };
  },
  watch: {
    scannerOpen(newVal) { if (newVal) this.startScan(); }
  }
});
</script>
