import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("userStore", () => {
  const user = ref<any | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  function setUser(data: any) {
    user.value = data;
  }

  function clearUser() {
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser
  };
}, {
  persist: {
    enabled: true,
    strategies: [{ key: 'userStore', storage: localStorage }]
  }
});
