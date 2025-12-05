<template>
  <BottomSheet v-model:visible="visible">
    <template #header>
      <h2 class="text-lg font-bold mb-2">Confirm Delivery</h2>
    </template>

    <template #body>
      <div class="space-y-2">
        <div v-if="order">
          <div><strong>Order No:</strong> {{ order.order_no ?? order.transaction_id }}</div>
          <div><strong>Customer:</strong> {{ order.customer_name }}</div>
          <div><strong>Address:</strong> {{ order.address }}</div>
          <div><strong>COD:</strong> {{ order.cod_amount }}</div>
        </div>

        <!-- Photo Upload -->
        <div class="mt-4">
          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFiles" />
          <button @click="openFileDialog" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Select Photos
          </button>

          <div v-if="photos.length" class="grid grid-cols-3 gap-2 mt-2">
            <div v-for="(file, index) in photos" :key="index" class="relative">
              <img :src="file.preview" class="w-full h-24 object-cover rounded" />
              <button @click="removePhoto(index)"
                      class="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center text-sm rounded-full">
                ×
              </button>
            </div>
          </div>
        </div>
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
import type { PreviewFile } from "@/types/file";

export default defineComponent({
  name: "ConfirmDeliveryModal",
  components: { BottomSheet },
  props: {
    visible: { type: Boolean, required: true },
    order: { type: Object, required: true },
  },
  emits: ["update:visible", "confirmed"],
  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null);
    const photos = ref<PreviewFile[]>([]);
    const loading = ref(false);

    const openFileDialog = () => {
      fileInput.value?.click();
    };

    const handleFiles = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach(f => {
        const file = f as PreviewFile;
        file.preview = URL.createObjectURL(file);
        photos.value.push(file);
      });
      if (fileInput.value) fileInput.value.value = "";
    };

    const removePhoto = (index: number) => {
      const file = photos.value[index];
      URL.revokeObjectURL((file as PreviewFile).preview);
      photos.value.splice(index, 1);
    };

    const cancel = () => emit("update:visible", false);

    const submit = async () => {
      if (!photos.value.length) {
        showAlert({ type: "error", messageKey: "pleaseAddPhoto" });
        return;
      }
      loading.value = true;

      try {
        const form = new FormData();
        form.append("transaction_id", props.order.transaction_id ?? props.order.id);
        photos.value.forEach(f => form.append("photos[]", f, f.name));

        const res = await API.post("/confirm-delivery-with-photos", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          showAlert({ type: "success", messageKey: "deliveryConfirmed" });
          emit("confirmed");
          emit("update:visible", false);
          photos.value.forEach(f => URL.revokeObjectURL(f.preview));
          photos.value = [];
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

    return { fileInput, photos, openFileDialog, handleFiles, removePhoto, cancel, submit, loading };
  },
});
</script>
