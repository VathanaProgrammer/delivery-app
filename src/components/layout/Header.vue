<template>
  <header class="bg-gray-900 text-white h-16 flex items-center justify-between px-4 shadow-md relative">
    <!-- Hamburger -->
    <div class="w-12">
      <button @click="$emit('toggle-sidebar')" class="text-white text-2xl">☰</button>
    </div>

    <!-- Title -->
    <h1 class="text-lg font-bold text-center flex-1">SOB</h1>

    <!-- Right actions -->
    <div class="flex justify-end items-center space-x-2">
      <!-- Language button with flag -->
      <button @click="$emit('show-lang-modal')"
        class="text-white font-bold hover:text-gray-300 transition flex items-center space-x-1">
        <img v-if="currentFlag" :src="currentFlag" alt="Flag" class="w-5 h-5 rounded-sm" />
        <span>{{ currentLang.toUpperCase() }}</span>
      </button>

      <!-- Map icon button -->
      <button
        @click="router.push('/map')"
        class="text-white hover:text-gray-300 transition flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600"
        title="Open Map"
      >
        <!-- Simple map SVG icon -->
      <Icon icon="line-md:map-marker-filled" width="20" height="20" />
      </button>
    </div>
  </header>
</template>


<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useUserStore } from "@/store/userStore.ts";
import { useLangStore } from "@/store/langStore.ts";
import router from "@/router/router.ts";
import { Icon } from '@iconify/vue';
import langDataJson from "@/lang.json";
import type { LangData } from "@/types/lang.ts";
import { useRouter } from "vue-router";

const langData = langDataJson as LangData;

export default defineComponent({
  name: "Header",
  components: { Icon },
  emits: ["show-lang-modal", "toggle-sidebar"],
  setup() {
    const router = useRouter();

    // User & language stores
    const userStore = useUserStore();
    const langStore = useLangStore();

    // Language text
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);

    // Profile popup
    const showProfilePopup = ref(false);

    // User data
    const user = computed(() => userStore.user);
    const userInitials = computed(() => {
      if (!user.value?.username) return "";
      return user.value.username.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    });

    // Actions
    const toggleProfilePopup = () => {
      showProfilePopup.value = !showProfilePopup.value;
    };
    const goLogin = () => router.push("/sign-in");
    const logout = () => {
      userStore.clearUser();
      showProfilePopup.value = false;
      router.push("/sign-in");
    };

    return {
      user,
      userInitials,
      currentLang: computed(() => langStore.currentLang),
      currentFlag: computed(() => langStore.currentFlag),
      showProfilePopup,
      toggleProfilePopup,
      logout,
      goLogin,
      currentText,
      langStore,
      router,
    };
  }
});
</script>

<style scoped>
header img {
  object-fit: cover;
}

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
