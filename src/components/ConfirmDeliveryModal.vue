<template>
    <BottomSheet :visible="visible" @update:visible="$emit('update:visible', $event)">
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

    <!-- Global Loading Overlay -->
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
import { ref, onMounted, toRaw, computed, unref  } from "vue";
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
        const activeOrder = computed(() => (props.visible ? unref(props.order) : null));
        onMounted(() => {
            console.log("Current user:", toRaw(userStore.id));
            console.log("Order prop:", toRaw(activeOrder));
        });

        const cancel = () => emit("update:visible", false);


        

        const submit = async () => {
            if (!props.order) return;

            loading.value = true;
            try {
                const res = await API.post("/confirm-delivery", {
                    transaction_id: props.order.transaction_id ?? props.order.id,
                    delivery_person: userStore.id, // only send user ID
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
};
</script>
