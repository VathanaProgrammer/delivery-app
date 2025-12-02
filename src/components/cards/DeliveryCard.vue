<template>
  <div class="bg-white rounded-xl p-4 shadow mb-4 hover:shadow-md transition flex flex-col space-y-3">

    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="font-semibold text-lg">{{ order.customer }}</h3>
      <span :class="statusClass" class="px-3 py-1 text-sm rounded-full font-medium">
        {{ order.status }}
      </span>
    </div>

    <!-- Address -->
    <div class="flex items-start gap-2 text-gray-600 text-sm">
      <Icon icon="mdi:map-marker" width="18" />
      <span class="flex-1">{{ order.address }}</span>
    </div>

    <!-- Phone -->
    <div class="flex items-center gap-2 text-gray-600 text-sm">
      <Icon icon="mdi:phone" width="18" />
      <span>{{ order.phone }}</span>
    </div>

    <!-- COD -->
    <div class="flex items-center gap-2 text-gray-700 text-sm">
      <Icon icon="mdi:cash" width="18" />
      COD: <strong>${{ order.cod.toFixed(2) }}</strong>
    </div>

    <!-- Quick Actions: Call & Map -->
    <div class="flex items-center justify-between mt-2 gap-2">
      <button @click="callCustomer" class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
        <Icon icon="mdi:phone-in-talk" width="20" />
        Call
      </button>
      <button @click="onMapClick" class="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">
        <Icon icon="mdi:map" width="20" />
        Map
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
    order: { type: Object as () => {
      customer: string;
      phone: string;
      address: string;
      cod: number;
      status: string;
    }, required: true },
  },
  emits: ["mapClick"],
  setup(props, { emit }) {
    const statusClass = computed(() => {
      switch (props.order.status) {
        case "Pending": return "bg-yellow-100 text-yellow-700";
        case "Shipping": return "bg-blue-100 text-blue-700";
        case "Delivered": return "bg-green-100 text-green-700";
        case "Failed": return "bg-red-100 text-red-700";
        default: return "bg-gray-100 text-gray-700";
      }
    });

    const callCustomer = () => {
      window.location.href = `tel:${props.order.phone}`;
    };

    const onMapClick = () => {
      // Emit custom event for parent component to handle
      emit("mapClick", props.order);
    };

    return { statusClass, callCustomer, onMapClick };
  },
});
</script>
