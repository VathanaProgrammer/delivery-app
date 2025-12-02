<template>
  <!-- Overlay -->
  <transition name="fade">
    <div v-if="visible" class="absolute inset-0 bg-black/50 z-40" @click.self="close"></div>
  </transition>

  <!-- Bottom Sheet Content -->
  <transition name="slide-up">
    <div v-if="visible"
         class="absolute bottom-0 left-0 right-0 bg-white w-full rounded-t-2xl p-4 shadow-lg z-50"
         :class="langClass">
      
      <!-- Header Slot -->
      <div class="flex justify-between items-center mb-4">
        <slot name="header">
          <h3 class="text-lg font-semibold text-gray-800">Modal</h3>
        </slot>
        <button @click="close"
                class="text-gray-500 p-3 text-2xl hover:text-gray-700 rounded-full flex items-center justify-center">
          &times;
        </button>
      </div>

      <!-- Body Slot -->
      <div class="modal-body">
        <slot name="body"></slot>
      </div>

      <!-- Footer Slot -->
      <div class="modal-footer mt-4">
        <slot name="footer"></slot>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BottomSheet",
  props: {
    visible: { type: Boolean, required: true },
    langClass: { type: String, default: "" },
  },
  emits: ["update:visible"],
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
  },
});
</script>

<style scoped>
/* Slide Up Animation */
.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); }
.slide-up-enter-to,
.slide-up-leave-from { transform: translateY(0%); }

/* Fade Animation for Overlay */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-to,
.fade-leave-from { opacity: 1; }
</style>
