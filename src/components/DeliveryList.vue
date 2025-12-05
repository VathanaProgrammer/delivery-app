<template>
  <div class="p-2 space-y-2">

    <!-- Tabs -->
    <TabsBar v-model="activeTab" :tabs="tabs" />

    <!-- Orders -->
    <div>
      <DeliveryCard v-for="o in filteredOrders" :key="o.order_no" :order="o" @dropOff="$emit('dropOff', $event)" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import TabsBar from "@/components/TabsBar.vue";
import DeliveryCard from "@/components/cards/DeliveryCard.vue";
import API from "@/api";

interface Order {
  customer_name: string | null;
  phone: string;
  address: string | null;
  order_no: string;
  cod_amount: string;
  shipping_status: string | null;
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
const orders = ref<Order[]>([]);

onMounted(async () => {
  try {
    const response = await API.get("/orders");
    console.log("Orders from API:", response.data.orders);
    orders.value = response.data.orders || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
});

watch(activeTab, (val) => {
  console.log("Active tab:", val);
});


const filteredOrders = computed(() => {
  if (activeTab.value === "All") {
    // Exclude cancelled and delivered in All tab
    return orders.value.filter(
      (o) =>
        o.shipping_status?.toLowerCase() !== "cancelled" &&
        o.shipping_status?.toLowerCase() !== "delivered"
    );
  }

  // Filter normally by active tab
  return orders.value.filter(
    (o) => o.shipping_status?.toLowerCase() === activeTab.value.toLowerCase()
  );
});


const showDropOffModal = ref(false);
const selectedOrder = ref<Order | null>(null);

function openDropOffModal(order: Order) {
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
