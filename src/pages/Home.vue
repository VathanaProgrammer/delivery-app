<template>
  <div class="p-4 h-full overflow-y-auto bg-gray-100 hide-scrollbar">

  <DeliveryList />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import DeliveryList from "@/components/DeliveryList.vue";
export default defineComponent({
  name: "Home",
  components: { DeliveryList },
  setup() {
    const tabs = [
      { label: "All", icon: "mdi:tray-full" },
      { label: "Pending", icon: "mdi:clock-outline" },
      { label: "Shipping", icon: "mdi:truck" },
      { label: "Delivered", icon: "mdi:check-circle-outline" },
      { label: "Failed", icon: "mdi:close-circle-outline" },
    ];

    const activeTab = ref("All");

    // STATIC DEMO DATA
    const orders = ref([
      {
        id: 1001,
        customer: "Srey Pov",
        phone: "093 123 456",
        address: "House 12A, St 289, Boeung Kak I, Toul Kork, Phnom Penh",
        cod: 12,
        status: "Pending",
      },
      {
        id: 1002,
        customer: "Vathana",
        phone: "088 555 222",
        address: "Street 2004, Sen Sok, Phnom Penh",
        cod: 0,
        status: "Shipping",
      },
      {
        id: 1003,
        customer: "Chakriya",
        phone: "099 777 888",
        address: "St 182, Chamkarmon, Phnom Penh",
        cod: 5,
        status: "Delivered",
      },
      {
        id: 1004,
        customer: "Pisey",
        phone: "012 345 888",
        address: "St 1019, Russey Keo",
        cod: 10,
        status: "Failed",
      },
    ]);

    // FILTER LOGIC
    const filteredOrders = computed(() => {
      if (activeTab.value === "All") return orders.value;
      return orders.value.filter((o) => o.status === activeTab.value);
    });

    return {
      tabs,
      activeTab,
      filteredOrders,
    };
  },
});
</script>

<style scoped>
/* Additional styling not needed */
</style>
