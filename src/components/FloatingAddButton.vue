<template>
  <div>
    <!-- Floating QR Button -->
    <button
      class="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px' }"
      @mousedown="startDrag" @touchstart.prevent="startDrag" @click="openScanner"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 13h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
      </svg>
    </button>

    <!-- QR Scanner Modal -->
    <transition name="fade">
      <div v-if="scannerOpen" class="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
        <!-- Scan Box -->
        <div class="relative w-64 h-64 border-4 border-white rounded-lg flex items-center justify-center">
          <div class="absolute w-full h-full bg-transparent border-2 border-dashed border-white animate-pulse"></div>
          <p class="text-white absolute -bottom-8 text-center text-sm">Align QR code inside the box</p>
        </div>

        <!-- Buttons -->
        <div class="mt-8 flex flex-col space-y-4 w-64">
          <button @click="openGallery" class="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition">
            Choose Photo
          </button>
          <button @click="closeScanner" class="w-full bg-gray-300 text-gray-800 py-3 rounded hover:bg-gray-400 transition">
            Close
          </button>
        </div>

        <!-- Hidden File Input -->
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleGalleryPhoto" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  name: "FloatingQRButton",
  setup() {
    const buttonSize = 56;
    const posX = ref<number>(0);
    const posY = ref<number>(0);
    const dragging = ref(false);
    const offset = { x: 0, y: 0 };
    const dragThreshold = 5;
    const startX = ref(0);
    const startY = ref(0);

    const scannerOpen = ref(false);
    const galleryInput = ref<HTMLInputElement | null>(null);

    // Bottom-center default position
    onMounted(() => {
      posX.value = window.innerWidth / 2 - buttonSize / 2;
      posY.value = window.innerHeight - buttonSize - 60;
    });

    const startDrag = (e: MouseEvent | TouchEvent) => {
      dragging.value = true;
      if (e instanceof MouseEvent) {
        startX.value = e.clientX;
        startY.value = e.clientY;
        offset.x = startX.value - posX.value;
        offset.y = startY.value - posY.value;
        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", stopDrag);
      } else if (e instanceof TouchEvent && e.touches[0]) {
        startX.value = e.touches[0].clientX;
        startY.value = e.touches[0].clientY;
        offset.x = startX.value - posX.value;
        offset.y = startY.value - posY.value;
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

      posX.value = Math.max(0, Math.min(posX.value, window.innerWidth - buttonSize));
      posY.value = Math.max(0, Math.min(posY.value, window.innerHeight - buttonSize));
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

    const openScanner = () => {
      scannerOpen.value = true;
    };

    const closeScanner = () => {
      scannerOpen.value = false;
    };

    const openGallery = () => {
      galleryInput.value?.click();
    };

    const handleGalleryPhoto = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        console.log("Selected photo for QR scan:", preview);
      }
    };

    return {
      posX,
      posY,
      startDrag,
      stopDrag,
      openScanner,
      closeScanner,
      openGallery,
      galleryInput,
      handleGalleryPhoto,
      scannerOpen,
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
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
