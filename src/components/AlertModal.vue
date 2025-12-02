<template>
  <transition name="fade">
    <div v-if="alertState.visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
      <div class="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
        <div class="flex items-center justify-center mb-4">
          <Icon v-if="alertState.type === 'success'" icon="mdi:check-circle-outline" class="text-green-500" width="32"
            height="32" />
          <Icon v-else-if="alertState.type === 'error'" icon="mdi:alert-circle-outline" class="text-red-500" width="32"
            height="32" />
          <Icon v-else icon="mdi:information-outline" class="text-blue-500" width="32" height="32" />
        </div>
        <h3 :class="{ 'kh': alertState.isKhmer }" class="text-lg font-bold mb-2">{{ alertState.title }}</h3>
        <p :class="{ 'kh': alertState.isKhmer }" class="text-gray-600 mb-4">{{ alertState.message }}</p>
        <button @click="closeAlert" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {{ currentLang === 'kh' ? langData.kh.ok : langData.en.ok }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed } from "vue";
import { defineComponent } from "vue";
import { Icon } from "@iconify/vue";
import langDataJson from "@/lang.json" with { type: "json" };
import { useLangStore } from "@/store/langStore";
import { alertState, closeAlert } from "@/alertService";

export default defineComponent({
  name: "AlertModal",
  components: { Icon },
  setup() {
    const langStore = useLangStore();

    const currentLang = computed(() => langStore.currentLang); // reactive
    return { alertState, closeAlert, langData: langDataJson, currentLang };
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
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
