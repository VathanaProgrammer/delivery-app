<template>
  <div class="bg-white rounded-lg p-4 shadow mb-3 transition">

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

    <!-- Show comment only when input is open -->
    <div v-if="showCommentInput" class="mt-2">
      <input
        v-model="comment"
        type="text"
        placeholder="Enter comment..."
        class="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div class="flex justify-end mt-1 gap-2">
        <button @click="submitComment" class="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600">
          Save
        </button>
        <button @click="cancelComment" class="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </div>

    <!-- Big Call & Drop Off Buttons + Small Comment Button -->
    <div
      v-if="order.shipping_status && order.shipping_status.toLowerCase() !== 'delivered' && order.shipping_status.toLowerCase() !== 'cancelled'"
      class="flex items-center justify-between mt-3 gap-2"
    >
      <button @click="callCustomer"
        class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm py-3 rounded-md hover:bg-green-600">
        <Icon icon="mdi:phone-in-talk" width="20" /> Call
      </button>

      <button @click="onDropOff"
        class="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white text-sm py-3 rounded-md hover:bg-blue-600">
        <Icon icon="mdi:package-check" width="20" /> Drop Off
      </button>

      <!-- Small button to open comment input -->
      <button @click="toggleCommentInput"
        class="flex-none flex items-center justify-center gap-1 bg-gray-200 text-gray-800 text-xs py-2 px-2 rounded-md hover:bg-gray-300">
        <Icon icon="mdi:message-text-outline" width="16" /> Comment
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  name: "DeliveryCard",
  components: { Icon },

  props: {
    order: { type: Object, required: true },
  },

  emits: ["dropOff", "addComment"],

  setup(props, { emit }) {
    const statusClass = computed(() => {
      switch (props.order.shipping_status) {
        case "ordered": return "bg-yellow-100 text-yellow-700";
        case "packed": return "bg-blue-100 text-blue-700";
        case "shipped": return "bg-indigo-100 text-indigo-700";
        case "delivered": return "bg-green-100 text-green-700";
        case "cancelled": return "bg-red-100 text-red-700";
        default: return "bg-gray-100 text-gray-700";
      }
    });

    const showCommentInput = ref(false);
    const comment = ref("");

    const callCustomer = () => {
      if (props.order.phone) window.location.href = `tel:${props.order.phone}`;
    };

    const onDropOff = () => emit("dropOff", props.order);

    const toggleCommentInput = () => {
      showCommentInput.value = !showCommentInput.value;
    };

    const submitComment = () => {
      if (comment.value.trim()) {
        emit("addComment", { order: props.order, comment: comment.value.trim() });
        comment.value = "";
        showCommentInput.value = false;
      }
    };

    const cancelComment = () => {
      comment.value = "";
      showCommentInput.value = false;
    };

    return {
      statusClass,
      callCustomer,
      onDropOff,
      showCommentInput,
      toggleCommentInput,
      comment,
      submitComment,
      cancelComment
    };
  },
});
</script>
