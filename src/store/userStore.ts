import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  id: "userStore",
  state: () => ({
    id: null,
    first_name: "",
    image_url: "",
    last_name: "",
    username: "",
    roles: [],
    // add any other fields you need
  }),
  getters: {
    isAuthenticated: (state: any) => !!state.id,
    displayName: (state: any) => state.username || state.last_name || state.first_name || "Unknown",
    roleName: (state: any) => {
      const role = state.roles?.[0]?.name || "";
      return role.split("#")[0];
    }
  },
  actions: {
    setUser(data: any) {
      Object.assign(this, data); // copy all fields directly to store
    },
    clearUser() {
      Object.assign(this, {
        id: null,
        image_url: "",
        first_name: "",
        last_name: "",
        username: "",
        roles: []
      });
    }
  },
  persist: {
    enabled: true,
    strategies: [{ key: "userStore", storage: localStorage }]
  }
});
