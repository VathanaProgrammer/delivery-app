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
        <div class="relative w-64 h-64 flex items-center justify-center">
          <qrcode-stream :camera="camera" @decode="onDecode" @init="onInit"
            class="absolute inset-0 w-full h-full z-10 rounded-lg overflow-hidden"></qrcode-stream>

          <!-- FRAME ON TOP -->
          <div class="qr-frame absolute z-20"></div>

          <!-- Animated Scan Line -->
          <div class="scan-line absolute z-30"></div>
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

    // position & rotation
    const posX = ref(window.innerWidth / 2 - 28); // center horizontally
    const posY = ref(window.innerHeight - 80);    // fixed bottom offset
    const rotation = ref(0);
    const dragging = ref(false);
    const moved = ref(false);
    const offset = { x: 0, y: 0 };

    // drag start
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

    // dragging
    const drag = (e: MouseEvent | TouchEvent) => {
      if (!dragging.value) return;
      moved.value = true;

      let clientX = 0, clientY = 0;
      if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
      else if (e instanceof TouchEvent && e.touches[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }

      posX.value = Math.max(0, Math.min(clientX - offset.x, window.innerWidth - 56));
      posY.value = Math.max(0, Math.min(clientY - offset.y, window.innerHeight - 56));

      rotation.value += 5; // rotate while dragging
    };

    // drag end
    const stopDrag = () => {
      dragging.value = false;
      rotation.value = 0; // stop rotation

      // snap to bottom-center
      posX.value = window.innerWidth / 2 - 28;
      posY.value = window.innerHeight - 80;

      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", drag);
      window.removeEventListener("touchend", stopDrag);
    };

    // click to open scanner if not dragged
    const handleClick = () => { if (!moved.value) scannerOpen.value = true; };

    const galleryInput = ref<HTMLInputElement | null>(null);
    const openGallery = () => galleryInput.value?.click();
    const handleGalleryPhoto = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) console.log("Selected photo:", URL.createObjectURL(file));
    };

    const camera = { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } };
    const onDecode = (result: string) => { console.log("QR code decoded:", result); scannerOpen.value = false; };
    const onInit = (promise: Promise<void>) => { promise.catch(err => console.error("Camera init error:", err)); };

    return { posX, posY, rotation, startDrag, stopDrag, handleClick, scannerOpen, openGallery, galleryInput, handleGalleryPhoto, camera, onDecode, onInit };
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

@keyframes scan-move {
  0% {
    top: 0;
  }

  100% {
    top: 100%;
  }
}

@keyframes scan-glow {
  0% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>
