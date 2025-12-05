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

    <!-- Call / Map -->
    <div class="flex items-center justify-between mt-3 gap-2">
      <button @click="callCustomer"
        class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm py-2 rounded-md hover:bg-green-600">
        <Icon icon="mdi:phone-in-talk" width="18" /> Call
      </button>

      <button @click="onMapClick"
        class="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 text-sm py-2 rounded-md hover:bg-gray-300">
        <Icon icon="mdi:map" width="18" /> Map
      </button>
    </div>

    <!-- Drop Off + Comment -->
    <div v-if="order.shipping_status === 'shipped'" class="flex items-center justify-between mt-2 gap-2">
      <button @click="onDropOff"
        class="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white text-sm py-2 rounded-md hover:bg-blue-600">
        <Icon icon="mdi:package-check" width="18" /> Drop Off
      </button>

      <button @click="onComment"
        class="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white text-sm py-2 rounded-md hover:bg-orange-600">
        <Icon icon="mdi:message-text" width="18" /> Comment
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  name: "DeliveryCard",
  components: { Icon },

  props: {
    order: {
      type: Object,
      required: true,
    },
  },

  emits: ["mapClick", "dropOff", "comment"],

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

    const callCustomer = () => {
      if (props.order.phone) window.location.href = `tel:${props.order.phone}`;
    };
    const onMapClick = () => emit("mapClick", props.order);
    const onDropOff = () => emit("dropOff", props.order);
    const onComment = () => emit("comment", props.order);

    return { statusClass, callCustomer, onMapClick, onDropOff, onComment };
  },
});
</script>
