<template>
  <div class="p-2 space-y-2">

    <!-- Tabs (existing) -->
    <TabsBar v-model="activeTab" :tabs="tabs" />

    <!-- Example: Three sections demo -->
    <section>
      <h2 class="text-lg font-semibold mb-2">Nearest Orders</h2>
      <DeliveryCard
        v-for="order in nearestOrders"
        :key="order.id"
        :order="order"
      />
    </section>

    <section>
      <h2 class="text-lg font-semibold mb-2">Assigned Orders</h2>
      <DeliveryCard
        v-for="order in assignedOrders"
        :key="order.id"
        :order="order"
      />
    </section>

    <section>
      <h2 class="text-lg font-semibold mb-2">Available Orders</h2>
      <DeliveryCard
        v-for="order in availableOrders"
        :key="order.id"
        :order="order"
      />
    </section>

    <!-- Existing filtered orders (Tabs controlled) -->
    <div>
      <DeliveryCard
        v-for="o in filteredOrders"
        :key="o.id"
        :order="o"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import TabsBar from "@/components/TabsBar.vue";
import DeliveryCard from "@/components/cards/DeliveryCard.vue";

const tabs = [
    { label: "All", icon: "mdi:apps" },
    { label: "Pending", icon: "mdi:clock-outline" },
    { label: "Shipping", icon: "mdi:truck" },
    { label: "Delivered", icon: "mdi:check-circle-outline" },
    { label: "Failed", icon: "mdi:alert-circle-outline" },
];

const activeTab = ref("All");

// Demo + existing orders
const orders = ref([
    { id: 1223, customer: "Srey Pov", phone: "093 123 456", address: "House 12A, St 289", cod: 12, status: "Pending", assigned: false },
    { id: 1224, customer: "Vathana", phone: "088 555 222", address: "Street 2004", cod: 0, status: "Shipping", assigned: true },
    { id: 1225, customer: "Chakriya", phone: "099 777 888", address: "St 182", cod: 5, status: "Delivered", assigned: false },
    { id: 1226, customer: "Pisey", phone: "012 345 888", address: "St 1019", cod: 10, status: "Pending", assigned: false },
]);

// Filter for tabs
const filteredOrders = computed(() => {
    if (activeTab.value === "All") return orders.value;
    return orders.value.filter((o) => o.status === activeTab.value);
});

// Demo: three sections
const nearestOrders = computed(() => orders.value.filter(o => !o.assigned && o.status === "Pending").slice(0, 2));
const assignedOrders = computed(() => orders.value.filter(o => o.assigned));
const availableOrders = computed(() => orders.value.filter(o => !o.assigned && o.status === "Pending"));
</script>

<style scoped>
h2 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.25rem;
}
</style>
