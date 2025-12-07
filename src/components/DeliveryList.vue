<template>
  <div class="p-2 space-y-2">

    <!-- Tabs -->
    <TabsBar v-model="activeTab" :tabs="translatedTabs" />

    <!-- Orders -->
    <div>
      <DeliveryCard v-for="o in filteredOrders" :key="o.order_no" @openComment="$emit('openComment', $event)" :order="o"
        @dropOff="$emit('dropOff', $event)" />
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import TabsBar from "@/components/TabsBar.vue";
import DeliveryCard from "@/components/cards/DeliveryCard.vue";
import { useOrder } from "@/global/useOrder.ts"; // import the composable
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";

import { useLangStore } from "@/store/langStore.ts";
import langDataJson from "@/lang.json";

const { orders, fetchOrders } = useOrder(); // call the composable to get reactive state & functions

const tabs = [
  { value: "all", label: "All", icon: "mdi:apps" },
  { value: "pick-up", label: "Pick-up", icon: "mdi:account-arrow-right" },
  { value: "shipped", label: "Shipped", icon: "mdi:truck" },
];


const langStore = useLangStore();
const langData = langDataJson;

// Create translated tabs
const translatedTabs = computed(() =>
  tabs.map(tab => {
    // Assert that currentLang is a key of langData
    const langKey = langStore.currentLang as keyof typeof langData;

    // Assert that tab.value is a key of langData[langKey]
    const tabKey = tab.value as keyof typeof langData[typeof langKey];

    return {
      ...tab,
      label: langData[langKey][tabKey] || tab.label
    };
  })
);

const activeTab = ref("All");

onMounted(() => {
  fetchOrders(); // call the function to load orders
});

watch(activeTab, (val) => {
  console.log("Active tab:", val);
});

const filteredOrders = computed(() => {
  const tab = activeTab.value.toLowerCase();

  if (tab === "all") {
    return orders.value;
  }

  if (tab === "padding") {
    // Combine multiple statuses for "Padding"
    const paddingStatuses = ["ordered", "packed"]; // <-- add any other pre-shipping statuses here
    return orders.value.filter(
      (o) => paddingStatuses.includes(o.shipping_status?.toLowerCase() || "")
    );
  }

  return orders.value.filter(
    (o) => o.shipping_status?.toLowerCase() === tab
  );
});

interface CommentPayload {
  order_id: number;
  comment: string;
}

// async function saveComment({ order_id, comment }: CommentPayload) {
//   try {
//     const res = await API.post("/save-comment", { invoice_no: order_id, comment });
//     if (res.data.success) {
//       showAlert({
//         type: "success",
//         messageKey: "Submitted_comment_successfully"
//       })
//     } else {
//       showAlert({
//         type: "error",
//         messageKey: res.data.msg || "something_went_wrong"
//       });
//     }
//   } catch (e) {
    
//     console.log("order_id: ", order_id);
//     console.log("comment: ", comment)
//     showAlert({
//       type: "error",
//       messageKey: "something_went_wrong"
//     });
//     console.log('error: ', e)
//   }
// }

</script>


<style scoped>
h2 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.25rem;
}
</style>
