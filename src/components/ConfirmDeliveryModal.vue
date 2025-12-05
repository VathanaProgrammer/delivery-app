<template>
  <BottomSheet v-model:visible="visible">
    <template #header>
      <h2 class="text-lg font-bold mb-2">Confirm Delivery</h2>
    </template>

    <template #body>
      <div class="space-y-2" v-if="order">
        <div><strong>Order No:</strong> {{ order.order_no ?? order.transaction_id }}</div>
        <div><strong>Customer:</strong> {{ order.customer_name }}</div>
        <div><strong>Address:</strong> {{ order.address }}</div>
        <div><strong>COD:</strong> {{ order.cod_amount }}</div>
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
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BottomSheet from "./BottomSheet.vue";
import API from "@/api";
import { showAlert } from "@/alertService";
import { useUserStore } from "@/store/userStore"; // your userStore
import { toRaw } from "vue";

export default defineComponent({
  name: "ConfirmDeliveryModal",
  components: { BottomSheet },
  props: {
    visible: { type: Boolean, required: true },
    order: { type: Object, required: true },
  },
  emits: ["update:visible", "confirmed"],
  setup(props, { emit }) {
    const loading = ref(false);
    const userStore = useUserStore(); // get logged in user

    console.log(toRaw(userStore.user)); // only log the user object, not the whole store
    console.log(toRaw(props.order))
    const cancel = () => emit("update:visible", false);

    const submit = async () => {
      loading.value = true;

      try {
        const res = await API.post("/confirm-delivery", {
          transaction_id: props.order.transaction_id ?? props.order.id,
          delivery_person: userStore.user.id, // assign delivery person
        });

        if (res.data.success) {
          showAlert({ type: "success", messageKey: "deliveryConfirmed" });
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

    return { cancel, submit, loading };
  },
});
</script>
