<template>
  <div>
    <!-- Draggable & Clickable QR Button -->
    <button
      class="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition fixed z-50"
      :style="{ top: posY + 'px', left: posX + 'px', transform: 'rotate(' + rotation + 'deg)' }"
      @mousedown="startDrag" @touchstart.prevent="startDrag" @click="openCamera"
    >
      <!-- QR Code Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 13h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
      </svg>
    </button>

    <!-- Hidden camera input -->
    <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handleCameraPhoto" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "FloatingQRButton",
  setup() {
    const posX = ref<number>(window.innerWidth - 80);
    const posY = ref<number>(window.innerHeight - 80);
    const dragging = ref<boolean>(false);
    const rotation = ref<number>(0);
    const offset = { x: 0, y: 0 };
    const dragThreshold = 5;

    let startX = 0;
    let startY = 0;

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

    const cameraInput = ref<HTMLInputElement | null>(null);

    const openCamera = () => {
      cameraInput.value?.click();
    };

    const handleCameraPhoto = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        console.log("Captured photo:", preview);
        // You can now upload or process the image
      }
    };

    return { posX, posY, rotation, startDrag, stopDrag, openCamera, cameraInput, handleCameraPhoto };
  },
});
</script>
