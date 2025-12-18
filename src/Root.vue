<template>
  <AlertModal />
  <GlobalLoading
    :visible="loadingStore.visible"
    :text="loadingStore.text"
  />
  <router-view />
</template>

<script lang="ts">
import AlertModal from './components/AlertModal.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import { useLoadingStore } from './store/loadingStore.ts'

export default {
  components: { AlertModal, GlobalLoading },
  setup() {
    const loadingStore = useLoadingStore()
    return { loadingStore }
  }
}
</script>
