<template>
  <div class="flex space-x-3 mb-4 overflow-x-auto pb-2 hide-scrollbar">
    <button
      v-for="t in tabs"
      :key="t.label"
      @click="$emit('update:modelValue', t.value)"
      class="flex items-center space-x-2 px-4 py-2 rounded-full border transition"
      :class="modelValue === t.label
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-300'"
    >
      <Icon :icon="t.icon" width="20" height="20" />
      <span>{{ t.label }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  name: "TabsBar",
  components: { Icon },

  props: {
    tabs: {
      type: Array as PropType<{ label: string; value: string; icon: string }[]>,
      required: true,
    },
    modelValue: { type: String, required: true },
  },
});
</script>

<style scoped>
button {
  white-space: nowrap;
}
</style>
