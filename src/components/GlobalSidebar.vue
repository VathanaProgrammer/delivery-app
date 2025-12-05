<template>
  <div v-if="modelValue" class="absolute inset-0 z-[999]flex">
    <!-- Overlay -->
    <transition name="fade">
      <div class="absolute inset-0 bg-black/30" @click="$emit('update:modelValue', false)">
      </div>
    </transition>

    <!-- Sidebar -->
    <transition name="slide-left">
      <div class="relative bg-white w-64 h-full shadow-xl p-4 flex flex-col">

        <!-- Header Row: Profile + Close Icon -->
        <div class="flex items-center justify-between mb-4">

          <!-- Profile -->
          <div class="flex items-center gap-3">
            <img :src="user.image_url" alt="Profile" class="w-12 h-12 rounded-full object-cover" />
            <div>
              <p class="text-sm font-semibold">{{ user?.first_name || user?.last_name || user?.username || "Unknown" }}
              </p>
              <p class="text-xs text-gray-500 -mt-0.5">{{ formattedRole}}</p>
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
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:truck-delivery" width="20" /> Deliveries
          </button>
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="mdi:cog" width="20" /> Settings
          </button>
          <button class="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Icon icon="majesticons:login" width="20" /> Login
          </button>
        </nav>

      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

export default defineComponent({
  name: "GlobalSidebar",
  components: { Icon },
  props: { modelValue: { type: Boolean, required: true } },
  emits: ["update:modelValue"],
  setup() {
    const user = useUserStore();
    console.log("user store: ", user)

    const router = useRouter();

    return { user, router };
  },
  methods: {
    goToHome() {
      this.router.push('/');
      this.$emit('update:modelValue', false);
    },
    async logout() {
      const user = useUserStore();
      user.$reset();
      this.router.push("/sign-in");
      this.$emit("update:modelValue", false);
    }
  },
  computed: {
    formattedRole() {
      const role = this.user.roles?.[0]?.name || "";
      return role.split("#")[0]; // "Delivery#6" → "Delivery"
    }
  }

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
