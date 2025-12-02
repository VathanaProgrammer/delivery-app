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

      <!-- User / Login -->
      <div v-if="user" class="relative">
        <button @click="toggleProfilePopup" class="flex items-center space-x-2 focus:outline-none">
          <img v-if="user.isAuthenticated" :src="user.profile_url" alt="User"
            class="w-8 h-8 rounded-full border border-white" />
          <div v-else class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
            {{ userInitials }}
          </div>
        </button>

        <!-- Profile Popup -->
        <transition name="fade">
          <div v-if="showProfilePopup"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div class="p-4 flex flex-col items-center space-y-2">
              <img
                :src="user.profile_url || 'https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg'"
                class="w-16 h-16 rounded-full object-cover" />
              <div class="text-center">
                <p class="font-semibold text-gray-800">{{ user.username || 'unknow' }}</p>
              </div>
            </div>
            <div class="border-t border-gray-200"></div>
            <button @click="logout"
              class="w-full flex items-center justify-center space-x-2 py-3 hover:bg-gray-100 transition rounded-b-lg text-red-600 font-semibold">
              <Icon icon="mdi:logout" width="20" height="20" />
              <span :class="{ kh: langStore.currentLang === 'kh' }">{{ currentText.logout }}</span>
            </button>
          </div>
        </transition>
      </div>

      <!-- Login button -->
      <template v-else>
        <button @click="goLogin" class="text-white hover:text-gray-300 font-semibold">Login</button>
      </template>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useUserStore } from "@/store/userStore";
import { useLangStore } from "@/store/langStore";
import router from "@/router/router";
import { Icon } from '@iconify/vue';
import langDataJson from "@/lang.json";
import type { LangData } from "@/types/lang";

const langData = langDataJson as LangData;

export default defineComponent({
  name: "Header",
  components: { Icon },
  emits: ["show-lang-modal", "toggle-sidebar"],
  setup() {

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
