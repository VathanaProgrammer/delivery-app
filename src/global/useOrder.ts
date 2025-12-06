import API from "@/api.ts";
import { ref } from "vue";

export interface Order {
  customer_name: string | null;
  phone: string;
  address: string | null;
  order_no: string;
  cod_amount: string;
  shipping_status: string | null;
  _updated?: number; // added for reactive re-render
}

export const orders = ref<Order[]>([]);

export const fetchOrders = async () => {
  try {
    const res = await API.get("/orders");
    // assign _updated so all objects are tracked
    orders.value = (res.data.orders || []).map((o: any) => ({ ...o, _updated: Date.now() }));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

export function useOrder() {
  return { orders, fetchOrders };
}
