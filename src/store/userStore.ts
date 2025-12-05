import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("userStore", () => {
  const _user = ref<any | null>(null); // keep internal ref

  // expose a "normal" user object, no .value needed
  const user = computed(() => _user.value);

  const isAuthenticated = computed(() => !!_user.value);

  const displayName = computed(() => {
    if (!_user.value) return "Unknown";
    return _user.value.first_name || _user.value.last_name || _user.value.username || "Unknown";
  });

  const roleName = computed(() => {
    const role = _user.value?.roles?.[0]?.name || "";
    return role.split("#")[0];
  });

  function setUser(data: any) {
    _user.value = data;
  }

  function clearUser() {
    _user.value = null;
  }

  return {
    user,          // now you can use user.first_name etc directly
    displayName,
    roleName,
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
