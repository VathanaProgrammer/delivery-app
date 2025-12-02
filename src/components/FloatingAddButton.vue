<template>
  <div>
    <!-- Draggable QR Floating Button -->
    <button
      class="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag"
      @click="scannerOpen = true"
    >
      QR
    </button>

    <!-- QR Scanner Overlay -->
    <transition name="fade">
      <div
        v-if="scannerOpen"
        class="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4"
      >
        <!-- QR Reader -->
        <qrcode-stream @decode="onDecode" @init="onInit">
          <div class="w-64 h-64 border-4 border-white rounded-lg flex items-center justify-center">
            <p class="text-white text-center">Align QR code here</p>
          </div>
        </qrcode-stream>

        <!-- Buttons -->
        <div class="mt-4 flex flex-col space-y-2 w-64">
          <button
            @click="openGallery"
            class="w-full bg-green-500 text-white py-3 rounded"
          >
            Choose Photo
          </button>
          <button
            @click="scannerOpen = false"
            class="w-full bg-gray-300 text-gray-800 py-3 rounded"
          >
            Close
          </button>
        </div>

        <!-- Hidden gallery input -->
        <input
          ref="galleryInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleGalleryPhoto"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";

export default defineComponent({
  name: "FloatingQRButton",
  components: { QrcodeStream },
  setup() {
    const scannerOpen = ref(false);

    // Draggable button state
    const posX = ref(window.innerWidth / 2 - 28); // center horizontally
    const posY = ref(window.innerHeight - 80);    // bottom position
    const rotation = ref(0);
    const dragging = ref(false);
    const offset = { x: 0, y: 0 };
    const dragThreshold = 5;
    let startX = 0, startY = 0;

    const startDrag = (e: MouseEvent | TouchEvent) => {
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
      let clientX = 0, clientY = 0;
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
      if (e) {
        if (e instanceof MouseEvent) {
          window.removeEventListener("mousemove", drag);
          window.removeEventListener("mouseup", stopDrag);
        } else if (e instanceof TouchEvent) {
          window.removeEventListener("touchmove", drag);
          window.removeEventListener("touchend", stopDrag);
        }
      }
    };

    // Gallery input
    const galleryInput = ref<HTMLInputElement | null>(null);
    const openGallery = () => galleryInput.value?.click();
    const handleGalleryPhoto = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) console.log("Selected photo:", URL.createObjectURL(file));
    };

    // QR Scanner
    const onDecode = (result: string) => {
      console.log("QR code decoded:", result);
      scannerOpen.value = false;
    };

    const onInit = (promise: Promise<void>) => {
      promise.catch(err => console.error("Camera init error:", err));
    };

    return {
      posX, posY, rotation, startDrag, stopDrag,
      scannerOpen, openGallery, galleryInput, handleGalleryPhoto,
      onDecode, onInit
    };
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-to,
.fade-leave-from { opacity: 1; }
</style>
