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
        <div><strong>COD:</strong> {{ activeOrder.cod_amount }}</div>
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
import { ref, computed, toRaw, unref } from "vue";
import BottomSheet from "./BottomSheet.vue";
import API from "@/api";
import { showAlert } from "@/alertService";
import { useUserStore } from "@/store/userStore";

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

    // Only show the order when modal is visible
    const activeOrder = computed(() => (props.visible ? props.order : null));

    const cancel = () => emit("update:visible", false);

    const submit = async () => {
      if (!activeOrder.value) return;

      loading.value = true;
      try {
        const res = await API.post("/confirm-delivery", {
          transaction_id: activeOrder.value.activeOrder,
          delivery_person: userStore.id, // fixed
        });

        if (res.data.success) {
          showAlert({ type: "success", messageKey: "deliveryConfirmed" });
          emit("confirmed");
          emit("update:visible", false);
        } else {
          showAlert({ type: "error", messageKey: "confirmFailed" });
        }

        console.log(res.data.data);
      } catch (err) {
        console.error(err);
        showAlert({ type: "error", messageKey: "confirmFailed" });
      } finally {
        loading.value = false;
      }
    };

    return { cancel, submit, loading, activeOrder };
  },
};
</script>
