// stores/loadingStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingStore = defineStore("loading", () => {
  const visible = ref(false);
  const text = ref("Loading...");

  const show = (msg?: string) => {
    if (msg) text.value = msg;
    visible.value = true;
  };

  const hide = () => {
    visible.value = false;
  };

  return { visible, text, show, hide };
});
