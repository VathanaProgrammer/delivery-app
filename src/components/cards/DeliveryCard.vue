<template>
  <div class="bg-white rounded-lg p-3 shadow mb-3 transition">

    <!-- Name + Status -->
    <div class="flex justify-between items-center mb-0.5">
      <h3 class="font-medium text-sm truncate">{{ order.customer }}</h3>
      <span :class="statusClass" class="px-2 py-0.5 text-xs rounded-md">
        {{ order.status }}
      </span>
    </div>

    <!-- Address -->
    <div class="flex items-start text-gray-600 text-xs gap-1">
      <Icon icon="mdi:map-marker" width="14" />
      <span class="leading-tight">{{ order.address }}</span>
    </div>

    <!-- Phone -->
    <div class="flex items-center text-gray-600 text-xs gap-1 mt-1">
      <Icon icon="mdi:phone" width="14" />
      <span>{{ order.phone }}</span>
    </div>

    <!-- COD -->
    <div class="flex items-center text-gray-700 text-xs gap-1 mt-1">
      <Icon icon="mdi:cash" width="14" />
      COD: <strong>${{ order.cod.toFixed(2) }}</strong>
    </div>

    <!-- Call / Map -->
    <div class="flex items-center justify-between mt-2 gap-2">
      <button @click="callCustomer"
        class="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-1.5 rounded-md hover:bg-green-600">
        <Icon icon="mdi:phone-in-talk" width="16" /> Call
      </button>

      <button @click="onMapClick"
        class="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-800 text-xs py-1.5 rounded-md hover:bg-gray-300">
        <Icon icon="mdi:map" width="16" /> Map
      </button>
    </div>

    <!-- Drop Off + Comment (ONLY when Shipping) -->
    <div v-if="order.status === 'Shipping'" class="flex items-center justify-between mt-2 gap-2">

      <button @click="onDropOff"
        class="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white text-xs py-1.5 rounded-md hover:bg-blue-600">
        <Icon icon="mdi:package-check" width="16" /> Drop Off
      </button>

      <button @click="onComment"
        class="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white text-xs py-1.5 rounded-md hover:bg-orange-600">
        <Icon icon="mdi:message-text" width="16" /> Comment
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
      switch (props.order.status) {
        case "Pending":
          return "bg-yellow-100 text-yellow-700";
        case "Shipping":
          return "bg-blue-100 text-blue-700";
        case "Delivered":
          return "bg-green-100 text-green-700";
        case "Failed":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    });

    const callCustomer = () => {
      window.location.href = `tel:${props.order.phone}`;
    };

    const onMapClick = () => emit("mapClick", props.order);
    const onDropOff = () => emit("dropOff", props.order);
    const onComment = () => emit("comment", props.order);

    return { statusClass, callCustomer, onMapClick, onDropOff, onComment };
  },
});
</script>
