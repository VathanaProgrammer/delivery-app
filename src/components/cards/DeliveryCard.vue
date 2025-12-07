<template>
  <div class="bg-white rounded-lg p-4 shadow mb-3 relative">
    <!-- Name + Status -->
    <div class="flex justify-between items-center mb-1">
      <div class="flex flex-col">
        <h3 class="font-semibold text-base truncate">{{ order.customer_name || "N/A" }}</h3>
        <span class="text-gray-600 font-bold text-sm truncate">
          {{ currentText.invoice_no }}: {{ order.order_no || "N/A" }}
        </span>
      </div>
      <span :class="statusClass" class="px-2 py-1 text-xs rounded-md">
        {{ order.shipping_status || "N/A" }}
      </span>
    </div>

    <!-- Address -->
    <div class="flex items-start text-gray-600 text-sm gap-1 leading-tight">
      <Icon icon="mdi:map-marker" width="16" />
      <span>{{ order.address || "N/A" }}</span>
    </div>

    <!-- Phone -->
    <div class="flex items-center text-gray-600 text-sm gap-1 mt-1 leading-tight">
      <Icon icon="mdi:phone" width="16" />
      <span>{{ order.phone || "N/A" }}</span>
    </div>

    <!-- COD -->
    <div class="flex items-center text-gray-700 text-sm gap-1 mt-1 leading-tight">
      <Icon icon="mdi:cash" width="16" />
      {{ currentText.cod }}: <strong>${{ Number(order.cod_amount || 0).toFixed(2) }}</strong>
    </div>

    <!-- Call & Drop Off Buttons -->
    <div v-if="order.shipping_status &&
      order.shipping_status.toLowerCase() !== 'delivered' &&
      order.shipping_status.toLowerCase() !== 'cancelled'"
      class="flex items-center justify-between mt-3 gap-2">
      <button @click="callCustomer"
        class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm py-3 rounded-md hover:bg-green-600">
        <Icon icon="mdi:phone-in-talk" width="20" />​{{ currentText.call }}
      </button>

      <button @click="onDropOff"
        class="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white text-sm py-3 rounded-md hover:bg-blue-600">
        <Icon icon="mdi:package-check" width="20" /> {{ currentText.drop_off }}
      </button>
    </div>

    <!-- Comment Icon -->
    <button @click="toggleComment"
      class="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full shadow hover:bg-gray-300">
      <Icon icon="mdi:message-text-outline" width="18" />
    </button>

    <!-- Comment Section (toggleable) -->
    <transition name="fade">
      <div v-if="showComment" class="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <!-- Dynamic comments -->
        <div v-for="comment in order.comments" :key="comment.id" class="flex gap-2 items-start bg-white p-2 rounded-md border border-gray-200">
          <img
            :src="comment.profile_pic || 'https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg'"
            class="w-8 h-8 rounded-full object-cover"
            alt="User"
          />
          <div class="flex-1">
            <p class="text-gray-800 text-sm font-semibold">{{ comment.first_name }} {{ comment.last_name }} <span class="text-gray-500 text-xs">({{ comment.username }})</span></p>
            <p class="text-gray-700 text-sm">{{API_BASE_PROFILE + comment.comment }}</p>
            <p class="text-gray-400 text-xs mt-1">{{ new Date(comment.created_at).toLocaleString() }}</p>
          </div>
        </div>

        <!-- Add Comment Button -->
        <button @click="openCommentSheet"
          class="flex items-center justify-center gap-2 bg-blue-500 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-600 w-full">
          <Icon icon="mdi:plus" width="16" /> Add Comment
        </button>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import { useLangStore } from "@/store/langStore.ts";
import langDataJson from "@/lang.json";
import type { LangData } from "@/types/lang.ts";
import { API_BASE_PROFILE } from "@/env.ts";
const langData = langDataJson as LangData;


export default defineComponent({
  name: "DeliveryCard",
  components: { Icon },

  props: {
    order: { type: Object, required: true },
  },

  setup() {
    const langStore = useLangStore();
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);
    const showComment = ref(false);

    const toggleComment = () => {
      showComment.value = !showComment.value;
    };

    return { currentText, showComment, toggleComment, API_BASE_PROFILE };
  },

  computed: {
    statusClass(): string {
      switch (this.order.shipping_status) {
        case "ordered": return "bg-yellow-100 text-yellow-700";
        case "packed": return "bg-blue-100 text-blue-700";
        case "shipped": return "bg-indigo-100 text-indigo-700";
        case "delivered": return "bg-green-100 text-green-700";
        case "cancelled": return "bg-red-100 text-red-700";
        default: return "bg-gray-100 text-gray-700";
      }
    },
  },

  methods: {
    callCustomer() {
      if (this.order.phone) window.location.href = `tel:${this.order.phone}`;
    },
    onDropOff() {
      this.$emit("dropOff", this.order);
    },
    openCommentSheet() {
      this.$emit("openComment", this.order);
    },
  },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
