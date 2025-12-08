<template>
  <div class="sign-in-page h-screen w-screen flex items-center justify-center bg-white">
    <div class="sign-in-box p-6 md:p-8 w-96 flex flex-col items-center">

      <!-- Avatar Image -->
      <img
        src="https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg"
        alt="User Avatar" class="w-24 h-24 rounded-full mb-4" />

      <h2 class="text-2xl font-bold mb-6 text-center">{{ currentText.sign_in }}</h2>

      <form class="w-full" @submit.prevent="handleSignIn">
        <div class="mb-4">
          <label for="email" class="block mb-1 font-medium">{{ currentText.email }}</label>
          <input v-model="email" type="email" required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="mb-6">
          <label for="password" class="block mb-1 font-medium">{{ currentText.password }}</label>
          <input v-model="password" type="password" required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
          Q{{  currentText.sign_in }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import API from "@/api.ts";
import { computed } from "vue";
import router from "@/router/router.js";
import { useLangStore } from "@/store/langStore.ts";
import { useUserStore } from "@/store/userStore.ts";
import langDataJson from "@/lang.json";
import type { LangData } from "@/types/lang.ts";

const langData = langDataJson as LangData;

export default {
  name: "SignIn",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  setup() {
    const langStore = useLangStore();
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);
    return { currentText }
  },
  methods: {
    async handleSignIn() {
      const userStore = useUserStore();
      try {
        const res = await API.post("/login", {
          email: this.email,
          password: this.password
        });

        if (res.data.success) {
          // Store user data in Pinia
          userStore.setUser(res.data.user);

          // Redirect to homepage or dashboard
          router.push("/");
        } else {
          alert(res.data.msg || "Invalid credentials");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Login failed. Please try again.");
      }
    },
    goSignUp() {
      router.push("/sign-up");
    }
  }
};
</script>

<style scoped>
.sign-in-box {
  max-width: 100%;
}
</style>
