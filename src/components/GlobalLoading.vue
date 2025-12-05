<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="bg-white p-4 rounded shadow flex items-center space-x-2">
        <Icon icon="mdi:loading" class="animate-spin" width="24" height="24" />
        <span>{{ text }}</span>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  name: "GlobalLoading",
  components: { Icon },
  props: {
    visible: { type: Boolean, required: true },
    text: { type: String, default: "Loading..." },
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
