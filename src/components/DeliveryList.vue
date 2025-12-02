<!-- src/pages/DeliveryList.vue -->
<template>
    <div>

        <!-- Tabs -->
        <TabsBar v-model="activeTab" :tabs="tabs" />

        <!-- Delivery Cards -->
        <DeliveryCard v-for="o in filteredOrders" :key="o.id" :order="o" />

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

const orders = ref([
    {
        id: 1223,
        customer: "Srey Pov",
        phone: "093 123 456",
        address: "House 12A, St 289, Boeung Kak I, Toul Kork, Phnom Penh",
        cod: 12,
        status: "Pending",
    },
    {
        id: 1224,
        customer: "Vathana",
        phone: "088 555 222",
        address: "Street 2004, Sen Sok, Phnom Penh",
        cod: 0,
        status: "Shipping",
    },
    {
        id: 1225,
        customer: "Chakriya",
        phone: "099 777 888",
        address: "St 182, Chamkarmon, Phnom Penh",
        cod: 5,
        status: "Delivered",
    },
]);

const filteredOrders = computed(() => {
    if (activeTab.value === "All") return orders.value;
    return orders.value.filter((o) => o.status === activeTab.value);
});
</script>
