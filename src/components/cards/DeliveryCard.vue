<template>
  <div class="bg-white rounded-lg p-4 shadow mb-3 relative">

    <!-- Name + Status -->
    <div class="flex justify-between items-center mb-1">
      <h3 class="font-semibold text-base truncate">{{ order.customer_name || "N/A" }}</h3>
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
      COD: <strong>${{ Number(order.cod_amount || 0).toFixed(2) }}</strong>
    </div>

    <!-- Call & Drop Off Buttons -->
    <div v-if="order.shipping_status &&
                order.shipping_status.toLowerCase() !== 'delivered' &&
                order.shipping_status.toLowerCase() !== 'cancelled'" 
         class="flex items-center justify-between mt-3 gap-2">
      <button @click="callCustomer"
        class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm py-3 rounded-md hover:bg-green-600">
        <Icon icon="mdi:phone-in-talk" width="20" /> Call
      </button>

      <button @click="onDropOff"
        class="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white text-sm py-3 rounded-md hover:bg-blue-600">
        <Icon icon="mdi:package-check" width="20" /> Drop Off
      </button>
    </div>

    <!-- Comment Icon -->
    <button @click="openCommentSheet"
      class="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full shadow hover:bg-gray-300">
      <Icon icon="mdi:message-text-outline" width="18" />
    </button>

    <!-- BottomSheet for Comment -->
    <BottomSheet v-model:visible="showCommentSheet">
      <template #header>{{ currentText.comment }}</template>

      <template #body>
        <input v-model="comment" type="text" placeholder="Enter comment..."
          class="w-full border border-gray-300 rounded-md p-2 focus:outline-none" />
      </template>

      <template #footer>
        <div class="flex gap-2">
          <button @click="submitComment" class="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          {{ currentText.ok }}
          </button>
          <button @click="cancelComment" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
            {{ currentText.close }}
          </button>
        </div>
      </template>
    </BottomSheet>

  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { Icon } from "@iconify/vue";
import BottomSheet from "@/components/BottomSheet.vue";
import { useLangStore } from "@/store/langStore.ts";
import type { LangData } from "@/types/lang.ts";
import langDataJson from "@/lang.json";

const langData = langDataJson as LangData;

export default defineComponent({
  name: "DeliveryCard",
  components: { Icon, BottomSheet },

  props: {
    order: { type: Object, required: true },
  },

  data() {
    return {
      showCommentSheet: false,
      comment: "",
    };
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
    currentText(): any {
      const langStore = useLangStore();
      return langData[langStore.currentLang as keyof LangData];
    }
  },

  methods: {
    callCustomer() {
      if (this.order.phone) window.location.href = `tel:${this.order.phone}`;
    },
    onDropOff() {
      this.$emit("dropOff", this.order);
    },
    openCommentSheet() {
      this.showCommentSheet = true;
    },
    submitComment() {
      if (!this.comment.trim()) return;

      this.$emit("addComment", {
        order_no: this.order.order_no,
        comment: this.comment.trim(),
      });

      this.comment = "";
      this.showCommentSheet = false;
    },
    cancelComment() {
      this.comment = "";
      this.showCommentSheet = false;
    },
  },
});
</script>

<style scoped>
/* BottomSheet animations already handled in BottomSheet component */
</style>
