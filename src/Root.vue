<template>
     <AlertModal />
  <router-view />
</template>

<script>
import AlertModal from './components/AlertModal.vue';
export default {
  components: { AlertModal }
};
</script>
