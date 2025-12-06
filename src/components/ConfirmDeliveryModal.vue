<template>
  <BottomSheet :visible="visible" @update:visible="$emit('update:visible', $event)">
    <template #header>
      <h2 class="text-lg font-bold mb-2">Confirm Delivery</h2>
    </template>

    <template #body>
      <div class="space-y-2" v-if="activeOrder">
        <div><strong>Order No:</strong> {{ activeOrder.order_no ?? activeOrder.transaction_id }}</div>
        <div><strong>Customer:</strong> {{ activeOrder.customer_name }}</div>
        <div><strong>Address:</strong> {{ activeOrder.address }}</div>
        <div><strong>COD:</strong> {{ Number(activeOrder.cod_amount || 0).toFixed(2) }}</div>
      </div>
    </template>

    <template #footer>
      <div class="flex space-x-2 mt-4">
        <button @click="submit" class="flex-1 bg-green-500 text-white py-2 rounded" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Confirm' }}
        </button>
        <button @click="cancel" class="flex-1 bg-gray-300 text-black py-2 rounded">Cancel</button>
      </div>
    </template>
  </BottomSheet>

  <transition name="fade">
    <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="bg-white p-4 rounded shadow flex items-center space-x-2">
        <span class="animate-spin">⏳</span>
        <span>Submitting...</span>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { ref, computed } from "vue";
import BottomSheet from "./BottomSheet.vue";
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";
import { useUserStore } from "@/store/userStore.ts";
import { useOrder } from "@/global/useOrder.ts";

export default {
  name: "ConfirmDeliveryModal",
  components: { BottomSheet },
  props: {
    visible: { type: Boolean, required: true },
    order: { type: Object, required: true },
  },
  emits: ["update:visible", "confirmed"],
  setup(props, { emit }) {
    const loading = ref(false);
    const userStore = useUserStore();
    const { orders, fetchOrders } = useOrder(); // get reactive orders

    // Only show the order when modal is visible
    const activeOrder = computed(() => (props.visible ? props.order : null));

    const cancel = () => emit("update:visible", false);

    const submit = async () => {
      if (!activeOrder.value) return;

      loading.value = true;
      try {
        const res = await API.post("/confirm-delivery", {
          transaction_id: activeOrder.value.order_no,
          delivery_person: userStore.id,
        });

        if (res.data.success) {
          showAlert({ type: "success", messageKey: "deliveryConfirmed" });

          // create a fully valid Order object
          const updatedOrder = {
            customer_name: activeOrder.value.customer_name ?? null,
            phone: activeOrder.value.phone ?? "",
            address: activeOrder.value.address ?? null,
            order_no: activeOrder.value.order_no ?? "",
            cod_amount: activeOrder.value.cod_amount ?? "",
            shipping_status: "shipped",
            _updated: Date.now(), // for forcing reactivity
          };

          const index = orders.value.findIndex(
            o => o.order_no === activeOrder.value!.order_no
          );

          if (index !== -1) {
            // replace existing
            orders.value[index] = updatedOrder;
          } else {
            // push new order
            orders.value.push(updatedOrder);
          }

          // force reactivity
          orders.value = [...orders.value];

          emit("confirmed");
          emit("update:visible", false);
        } else {
          showAlert({ type: "error", messageKey: "confirmFailed" });
        }
      } catch (err) {
        console.error(err);
        showAlert({ type: "error", messageKey: "confirmFailed" });
      } finally {
        loading.value = false;
      }
    };

    return { cancel, submit, loading, activeOrder, orders };
  },
};
</script>
