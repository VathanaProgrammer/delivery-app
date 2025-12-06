import API from "@/api.ts";
import { ref } from 'vue';

export function useOrder() {
    // Define Order type inside composable
    interface Order {
        customer_name: string | null;
        phone: string;
        address: string | null;
        order_no: string;
        cod_amount: string;
        shipping_status: string | null;
    }

    // Reactive orders array with proper type
    const orders = ref<Order[]>([]);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders');
            orders.value = res.data.orders || [];
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    return { orders, fetchOrders };
}
