<template>
    <AlertModal />
    <GlobalLoading :visible="loadingStore.visible" :text="loadingStore.text" />
  <router-view />
</template>

<script>
import AlertModal from './components/AlertModal.vue';
import GlobalLoading from './components/GlobalLoading.vue';
import { useLoadingStore } from './store/loadingStore';

const loadingStore = useLoadingStore()

export default {
  components: { AlertModal, GlobalLoading },
  
};
</script>
