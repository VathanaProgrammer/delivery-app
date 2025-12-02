<template>
  <div v-if="modelValue" class="absolute inset-0 z-50 flex">
    <!-- Overlay fades only -->
    <transition name="fade">
      <div class="absolute inset-0 bg-black/30" @click="$emit('update:modelValue', false)"></div>
    </transition>

    <!-- Sidebar slides in (push) -->
    <transition name="slide-left">
      <div class="relative bg-white w-64 h-full shadow-xl p-4 flex flex-col">
        <button @click="$emit('update:modelValue', false)" class="self-end p-2 text-gray-600 hover:text-gray-800">
          &times;
        </button>

        <nav class="mt-4 flex flex-col gap-3">
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:home" width="20" /> Home
          </button>
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:truck-delivery" width="20" /> Deliveries
          </button>
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:cog" width="20" /> Settings
          </button>
        </nav>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  name: "GlobalSidebar",
  components: { Icon },
  props: { modelValue: { type: Boolean, required: true } },
  emits: ["update:modelValue"],
});
</script>

<style scoped>
/* Sidebar slides in from left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

/* Overlay fade only */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-to,
.fade-leave-from { opacity: 1; }
</style>
