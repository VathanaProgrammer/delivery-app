import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import enFlag from "@/assets/images/en.webp";
import khFlag from "@/assets/images/kh.webp";

export const useLangStore = defineStore('langStore', () => {
  const currentLang = ref<'en' | 'kh'>('en');
  const flags = ref({ en: enFlag, kh: khFlag });

  const currentFlag = computed(() => flags.value[currentLang.value]);

  function switchLang(lang: 'en' | 'kh') {
    currentLang.value = lang;
  }

  return { currentLang, flags, currentFlag, switchLang };
}, {
  persist: true,
});
