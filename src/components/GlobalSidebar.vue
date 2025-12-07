<template>
  <div v-if="modelValue" class="absolute inset-0 z-[999] flex">
    <!-- Overlay -->
    <transition name="fade">
      <div class="absolute inset-0 bg-black/30" @click="$emit('update:modelValue', false)"></div>
    </transition>

    <!-- Sidebar -->
    <transition name="slide-left">
      <div class="relative bg-white w-64 h-full shadow-xl p-4 flex flex-col">

        <!-- Header Row: Profile + Close Icon -->
        <div class="flex items-center justify-between mb-4">
          <!-- Profile -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <img :src="user.image_url || defaultAvatar" alt="Profile"
                class="w-12 h-12 rounded-full object-cover cursor-pointer" @click="triggerFileInput" />
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            </div>
            <div>
              <p class="text-sm font-semibold">{{ user.displayName }}</p>
              <p class="text-xs text-gray-500 -mt-0.5">{{ user.roleName }}</p>
            </div>
          </div>

          <!-- Close -->
          <button @click="$emit('update:modelValue', false)"
            class="p-2 text-gray-600 hover:text-gray-800 text-xl leading-none">
            &times;
          </button>
        </div>

        <!-- Menu -->
        <nav class="flex flex-col gap-3">
          <button @click="goToHome" class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:home" width="20" /> Home
          </button>
          <button @click="logout" class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="majesticons:login" width="20" /> Logout
          </button>
        </nav>

      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore.ts";
import API from "@/api.ts";

export default defineComponent({
  name: "GlobalSidebar",
  components: { Icon },
  props: { modelValue: { type: Boolean, required: true } },
  emits: ["update:modelValue"],
  setup() {
    const user = useUserStore();
    const router = useRouter();
    const fileInput = ref<HTMLInputElement | null>(null);
    const defaultAvatar =
      "https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg";

    // Trigger file input click
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    // Handle file change
    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0]; // could be undefined
      if (!file) return; // <-- exit if no file selected

      const formData = new FormData();
      formData.append("profile_pic", file); // now TypeScript knows file exists

      try {
        const res = await API.post("/user/profile-pic", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          user.image_url = res.data.image_url; // reactive update
        }
      } catch (err) {
        console.error("Failed to update profile pic", err);
      }
    };


    const goToHome = () => {
      router.push("/");
    };

    const logout = async () => {
      try {
        const res = await API.post("/logout");
        if (res.data.success) {
          user.$reset();
          router.push("/sign-in");
        }
      } catch (err) {
        console.error(err);
      }
    };

    return {
      user,
      router,
      fileInput,
      defaultAvatar,
      triggerFileInput,
      handleFileChange,
      goToHome,
      logout,
    };
  },
});
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
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
