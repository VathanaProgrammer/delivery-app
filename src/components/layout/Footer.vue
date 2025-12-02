<template>
  <footer class="bg-gray-900 text-white h-16 flex items-center justify-center px-6 shadow-md relative">

    <!-- Center: Home button -->
    <button class="flex flex-col items-center justify-center text-white hover:text-gray-300 transition">
      <Icon icon="bxs:home" width="24" height="24" />
      <span class="text-xs font-semibold">Home</span>
    </button>

    <!-- Right: Add / Plus button -->
    <!-- <button
      @click="$emit('show-add-modal')"
      class="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button> -->
  </footer>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue';
export default {
  name: 'Footer',
  components: { Icon },
}
</script>

<style scoped>
footer {
  position: relative;
}
</style>
