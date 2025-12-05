<template>
  <div class="p-2 space-y-2">

    <!-- Tabs (existing) -->
    <TabsBar v-model="activeTab" :tabs="tabs" />

    <!-- Example: Three sections demo -->

    <!-- Existing filtered orders (Tabs controlled) -->
    <div>
      <DeliveryCard v-for="o in filteredOrders" :key="o.id" :order="o" @dropOff="$emit('dropOff', $event)" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import TabsBar from "@/components/TabsBar.vue";
import DeliveryCard from "@/components/cards/DeliveryCard.vue";
import API from "@/api";

interface Order {
  id: number;
  customer: string;
  phone: string;
  address: string;
  cod: number;
  status: string;
  assigned: boolean;
}

const tabs = [
  { label: "All", icon: "mdi:apps" },
  { label: "Ordered", icon: "mdi:clock-outline" },
  { label: "Packed", icon: "mdi:package-variant-closed" },
  { label: "Cancelled", icon: "mdi:close-circle-outline" },
  { label: "Shipped", icon: "mdi:truck" },
  { label: "Delivered", icon: "mdi:check-circle-outline" },
];

const activeTab = ref("All");

// Demo + existing orders
const orders = ref<Order[]>([]);
orders.value = await API.get('/orders'); // make sure API returns Order[]
// Filter for tabs
const filteredOrders = computed(() => {
  if (activeTab.value === "All") return orders.value;
  return orders.value.filter((o: Order) => o.status.toLowerCase() === activeTab.value.toLowerCase());
});

// Demo: three sections
// const nearestOrders = computed(() => orders.value.filter(o => !o.assigned && o.status === "Pending").slice(0, 2));
// const assignedOrders = computed(() => orders.value.filter(o => o.assigned));
// const availableOrders = computed(() => orders.value.filter(o => !o.assigned && o.status === "Pending"));
const showDropOffModal = ref(false);
const selectedOrder = ref<any>(null);
function openDropOffModal(order: any) {
  selectedOrder.value = order;
  showDropOffModal.value = true;
}
</script>

<style scoped>
h2 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.25rem;
}
</style>
