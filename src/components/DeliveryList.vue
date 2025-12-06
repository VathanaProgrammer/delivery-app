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
import API from "@/api.ts";

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
  { label: "Padding", icon: "mdi:clock-outline" },   // or any icon you want
  { label: "Pick-up", icon: "mdi:account-arrow-right" },
  { label: "Shipping", icon: "mdi:truck" },
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
  const tab = activeTab.value.toLowerCase();

  if (tab === "all") {
    return orders.value; // all orders (backend already filtered cancelled + delivered)
  }

  if (tab === "padding") {
    // Any order that is NOT pick-up or shipping goes to Padding
    return orders.value.filter(
      (o) => {
        const status = o.shipping_status?.toLowerCase();
        return status !== "pick-up" && status !== "shipping";
      }
    );
  }

  // For Pick-Up and Shipping tabs
  return orders.value.filter(
    (o) => o.shipping_status?.toLowerCase() === tab
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
