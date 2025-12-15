import API from "@/api.ts";
import { ref } from "vue";

export interface MapItem {
    id: number | null;
    name: string | null;
    phone: string | null;
    latitude: string | null;
    longitude: string | null;
}

export const mapList = ref<MapItem[]>([]);

export const fetchMap = async () => {
    try {
        const res = await API.get('getMaps');

        if (res.data.success) {
            // assuming backend returns { success: true, data: [] }
            mapList.value = res.data.data as MapItem[];
            console.log('map data', mapList.value);
        }
    } catch (e) {
        console.warn('error', e);
    }
};
