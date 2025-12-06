import API from "@/api.ts";
import { ref } from 'vue';
export interface Order {
  customer_name: string | null;
  phone: string;
  address: string | null;
  order_no: string;
  cod_amount: string;
  shipping_status: string | null;
}

// <-- shared reactive state
export const orders = ref<Order[]>([]);

export const fetchOrders = async () => {
  try {
    const res = await API.get('/orders');
    orders.value = res.data.orders || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

// composable returns shared state
export function useOrder() {
  return { orders, fetchOrders };
}
