import { defineStore } from "pinia";
import { ref } from "vue";

export const useSidebarStore = defineStore("sidebar", () => {
  // State
  const visible = ref(false);

  // Actions
  const toggle = () => (visible.value = !visible.value);
  const open = () => (visible.value = true);
  const close = () => (visible.value = false);

  return { visible, toggle, open, close };
});
