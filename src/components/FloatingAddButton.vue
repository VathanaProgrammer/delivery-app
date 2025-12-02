<template>
  <div>
    <!-- Draggable QR Floating Button -->
    <button
      class="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }" @mousedown="startDrag"
      @touchstart="startDrag" @click="handleClick">
      QR
    </button>

    <!-- QR Scanner Overlay -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4">
        <!-- Close Button -->
        <button class="absolute top-4 right-4 text-white text-3xl font-bold" @click="scannerOpen = false">
          &times;
        </button>
        <!-- QR Scanner Container -->
        <div class="relative w-full max-w-xs h-64 flex items-center justify-center">

          <!-- FRAME BELOW CAMERA (correction) -->
          <div class="qr-frame"></div>

          <!-- CAMERA ABOVE — REQUIRED!!! -->
          <qrcode-stream :camera="camera" @decode="onDecode" @init="onInit"
            class="absolute inset-0 w-full h-full z-20"></qrcode-stream>

          <!-- Animated Scan Line (safe) -->
          <div class="scan-line"></div>

        </div>


        <!-- Action Buttons -->
        <div class="absolute bottom-16 flex flex-col space-y-2 w-64">
          <button @click="openGallery" class="w-full bg-green-500 text-white py-3 rounded">Choose Photo</button>
          <button @click="scannerOpen = false" class="w-full bg-gray-300 text-gray-800 py-3 rounded">Close</button>
        </div>

        <!-- Hidden gallery input -->
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleGalleryPhoto" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";

export default defineComponent({
  components: { QrcodeStream },
  setup() {
    const scannerOpen = ref(false);
    const qrZoom = ref(false);

    // Draggable button state
    const posX = ref(window.innerWidth / 2 - 28);
    const posY = ref(window.innerHeight - 80);
    const rotation = ref(0);
    const dragging = ref(false);
    const offset = { x: 0, y: 0 };
    const dragThreshold = 5;
    let startX = 0,
      startY = 0;
    let moved = false;

    const startDrag = (e: MouseEvent | TouchEvent) => {
      moved = false;
      dragging.value = true;
      if (e instanceof MouseEvent) {
        startX = e.clientX;
        startY = e.clientY;
        offset.x = startX - posX.value;
        offset.y = startY - posY.value;
        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", stopDrag);
      } else if (e instanceof TouchEvent && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        offset.x = startX - posX.value;
        offset.y = startY - posY.value;
        window.addEventListener("touchmove", drag);
        window.addEventListener("touchend", stopDrag);
      }
    };

    const drag = (e: MouseEvent | TouchEvent) => {
      if (!dragging.value) return;
      moved = true; // mark that user moved the button
      let clientX = 0,
        clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else return;

      posX.value = clientX - offset.x;
      posY.value = clientY - offset.y;

      posX.value = Math.max(0, Math.min(posX.value, window.innerWidth - 56));
      posY.value = Math.max(0, Math.min(posY.value, window.innerHeight - 56));

      rotation.value += 5;
    };

    const stopDrag = (e?: MouseEvent | TouchEvent) => {
      dragging.value = false;
      if (e instanceof MouseEvent) {
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("mouseup", stopDrag);
      } else if (e instanceof TouchEvent) {
        window.removeEventListener("touchmove", drag);
        window.removeEventListener("touchend", stopDrag);
      }
    };

    // Only open scanner if button wasn't dragged
    const handleClick = () => {
      if (!moved) scannerOpen.value = true;
    };

    // Gallery input
    const galleryInput = ref<HTMLInputElement | null>(null);
    const openGallery = () => galleryInput.value?.click();
    const handleGalleryPhoto = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) console.log("Selected photo:", URL.createObjectURL(file));
    };

    const camera = {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    };

    const onDecode = (result: string, bounds?: DOMRect) => {
      if (bounds) {
        const size = Math.min(bounds.width, bounds.height);
        if (size < 100) {
          qrZoom.value = true;
          return;
        }
      }
      console.log("QR code decoded:", result);
      scannerOpen.value = false;
    };

    const onInit = (promise: Promise<void>) => {
      promise.catch((err) => console.error("Camera init error:", err));
    };

    return {
      posX,
      posY,
      rotation,
      startDrag,
      stopDrag,
      handleClick,
      scannerOpen,
      openGallery,
      galleryInput,
      handleGalleryPhoto,
      camera,
      onDecode,
      onInit,
      qrZoom,
    };
  },
});
</script>

<style scoped>
.qr-frame {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 16px;
  top: calc(50% - 130px);
  left: calc(50% - 130px);
  box-shadow: 0 0 25px rgba(0, 255, 180, 0.25);
  z-index: 5;
  /* BELOW CAMERA */
  pointer-events: none;
}

.scan-line {
  position: absolute;
  top: 0;
  width: 260px;
  height: 3px;
  background: rgba(0, 255, 170, 0.9);
  animation: scan-move 2s infinite linear;
  z-index: 25;
  /* ABOVE CAMERA but not blocking */
  pointer-events: none;
}

/* Corners JUST FOR DECORATION */
.qr-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #00ffbb;
  z-index: 10;
  pointer-events: none;
}
</style>
