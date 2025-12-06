<template>
  <div class="p-4 h-full overflow-y-auto bg-gray-100 hide-scrollbar">
    <!-- Delivery list -->
    <DeliveryList @dropOff="openDropOffModal"  @openComment="openComment" />

    <BottomSheet v-model:visible="showAddModal" :langClass="langStore.currentLang">

      <!-- Header -->
      <template #header>
        Drop Off
      </template>

      <!-- Body -->
      <template #body>
        <div class="space-y-4">

          <!-- Order Details -->
          <div class="p-3 bg-gray-100 rounded space-y-1">
            <div><strong>Order No:</strong> {{ selectedOrder?.order_no || "N/A" }}</div>
            <div><strong>Customer:</strong> {{ selectedOrder?.customer_name || "N/A" }}</div>
            <div><strong>Address:</strong> {{ selectedOrder?.address || "N/A" }}</div>
            <div><strong>COD:</strong> ${{ Number(selectedOrder?.cod_amount || 0).toFixed(2) }}</div>
          </div>

          <!-- Photo previews -->
          <div v-if="photos.length" class="grid grid-cols-3 gap-2 mt-2 mb-2">
            <div v-for="(file, index) in photos" :key="index" class="relative">
              <img :src="file.preview" alt="preview" class="w-full h-24 object-cover rounded" />
              <button @click="removePhoto(index)"
                class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                ×
              </button>
            </div>
          </div>

          <!-- Camera & Gallery Buttons -->
          <div class="flex space-x-2">
            <button @click="openCamera"
              class="flex-1 bg-gray-200 text-black py-3 rounded flex items-center justify-center space-x-2 hover:bg-gray-300 transition">
              <Icon icon="mdi:camera" width="20" height="20" />
              <span>{{ currentText.takePhoto }}</span>
            </button>

            <button @click="openGallery"
              class="flex-1 bg-gray-200 text-black py-3 rounded flex items-center justify-center space-x-2 hover:bg-gray-300 transition">
              <Icon icon="mdi:image-multiple" width="20" height="20" />
              <span>{{ currentText.selectPhotos }}</span>
            </button>
          </div>

          <!-- Hidden file inputs for camera/gallery -->
          <input type="file" accept="image/*" capture="environment" ref="cameraInput" class="hidden"
            @change="handleCameraPhoto" />
          <input type="file" accept="image/*" multiple ref="galleryInput" class="hidden"
            @change="handleGalleryPhotos" />

        </div>
      </template>

      <!-- Footer -->
      <template #footer>
        <button @click="submitEntry"
          class="w-full bg-green-500 text-white py-3 rounded flex items-center justify-center">
          <Icon icon="mdi:check" width="20" height="20" />
          <span>{{ isLoading ? currentText.submitting : currentText.submit }}</span>
        </button>
      </template>

    </BottomSheet>

    <BottomSheet v-model:visible="showCommentSheet">
      <template #header>{{ currentText.comment }}</template>

      <template #body>
        <div v-if="selectedOrder">
          <div><strong>Order No:</strong> {{ selectedOrder.order_no }}</div>
          <div><strong>Customer:</strong> {{ selectedOrder.customer_name }}</div>
          <input v-model="comment" type="text" placeholder="Enter comment..."
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none mt-2" />
        </div>
      </template>

      <template #footer>
        <div class="flex gap-2">
          <button @click="submitComment" class="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            {{ currentText.ok }}
          </button>
          <button @click="closeSheet" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
            {{ currentText.close }}
          </button>
        </div>
      </template>
    </BottomSheet>

  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import enFlag from "@/assets/images/en.webp";
import khFlag from "@/assets/images/kh.webp";
import { useLangStore } from "@/store/langStore.ts";
import { useUserStore } from "@/store/userStore.ts";
import langDataJson from "@/lang.json";
import { Icon } from "@iconify/vue";
import BottomSheet from "@/components/BottomSheet.vue";
import DeliveryList from "@/components/DeliveryList.vue";
import API from "@/api.ts";
import { showAlert } from "@/alertService.ts";
import { useLoadingStore } from "@/store/loadingStore.ts";
import { fetchOrders } from "@/global/useOrder.ts";

import type { LangData } from "@/types/lang.ts";

const langData = langDataJson as LangData;

interface PreviewFile extends File {
  preview: string;
}

export default defineComponent({
  name: "App",
  components: { Icon, DeliveryList, BottomSheet },
  data() {
    return {
      showAddModal: false,
      nameInput: "",
      phoneInput: "",
      addressInput: "",
      invoice_no: "",
      photos: [] as PreviewFile[],
      orders: [] as any[],
      comment: '',
      showCommentSheet: false,
      enFlag,
      khFlag,
      isLoading: false,
      selectedOrder: null as any
    };
  },
  setup() {
    const langStore = useLangStore();
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);
    return { langStore, currentText, fetchOrders };
  },
  mounted() {
    const langStore = useLangStore();
    if (!langStore.currentLang) {
      langStore.switchLang("kh");
    }
  },
  methods: {
    // Called when DeliveryCard emits 'openComment'
    openComment(order: any) {
      this.selectedOrder = order;
      this.comment = ""; // reset input
      this.showCommentSheet = true;
    },

    closeSheet() {
      this.showCommentSheet = false;
    },

    async submitComment() {
      if (!this.comment.trim() || !this.selectedOrder) return;

      try {
        const res = await API.post("/save-comment", {
          invoice_no: this.selectedOrder.order_no,
          comment: this.comment.trim(),
        });

        if (res.data.success) {
          showAlert({ type: "success", messageKey: "Submitted_comment_successfully" });
        } else {
          showAlert({ type: "error", messageKey: res.data.msg || "something_went_wrong" });
        }
      } catch (e) {
        console.error(e);
        showAlert({ type: "error", messageKey: "something_went_wrong" });
      } finally {
        this.comment = "";
        this.showCommentSheet = false;
      }
    },
    openDropOffModal(order: any) {
      this.selectedOrder = order;
      this.showAddModal = true;
    },

    openCamera(event?: Event) {
      event?.stopPropagation();
      (this.$refs.cameraInput as HTMLInputElement).click();
    },

    openGallery(event?: Event) {
      event?.stopPropagation();
      (this.$refs.galleryInput as HTMLInputElement).click();
    },

    handleCameraPhoto(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) this.addPreview(file);
    },

    handleGalleryPhotos(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(f => this.addPreview(f));
    },

    addPreview(file: File) {
      const previewFile = file as PreviewFile;
      previewFile.preview = URL.createObjectURL(file);
      this.photos.push(previewFile);
    },

    removePhoto(index: number) {
      const photo = this.photos[index];
      if (photo) {
        URL.revokeObjectURL(photo.preview);
        this.photos.splice(index, 1);
      }
    },

    async submitEntry() {
      if (this.photos.length === 0) {
        showAlert({
          type: "error",
          messageKey: "pleaseAddPhoto"
        });
        return;
      }


      // debug: always log the actual selectedOrder and keys
      console.log("SUBMIT - selectedOrder snapshot:", this.selectedOrder);

      // make a plain snapshot to avoid proxy weirdness
      const order = this.selectedOrder ? { ...this.selectedOrder } : null;
      console.log("SUBMIT - order snapshot (plain):", order);

      // robust invoice extraction (tries multiple common keys)
      const invoice =
        (order && (order.order_no ?? order.invoice_no ?? order.transaction_id ?? order.id ?? order.orderNo ?? order.ref_no)) || "";

      console.log("SUBMIT - resolved invoice:", invoice);

      this.isLoading = true;
      const showLoading = useLoadingStore();
      showLoading.show('Please wait...')
      try {
        const userStore = useUserStore();
        const userId = userStore.id;
        let latitude = null;
        let longitude = null;

        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              pos => { latitude = pos.coords.latitude; longitude = pos.coords.longitude; resolve(true); },
              () => resolve(true)
            );
          });
        }

        const form = new FormData();
        form.append("name", this.selectedOrder.customer_name);
        form.append("phone", this.selectedOrder.phone);
        form.append("address_detail", this.selectedOrder.address);
        form.append('invoice_no', this.selectedOrder.order_no);
        form.append("latitude", latitude ?? "");
        form.append("longitude", longitude ?? "");
        form.append("collector_id", userId);

        this.photos.forEach(file => {
          const fileName = file.name || `photo-${Date.now()}.jpg`;
          form.append("photos[]", file, fileName);
        });

        const res = await API.post("/save-drop-off", form, { headers: { "Content-Type": "multipart/form-data" } });

        this.nameInput = "";
        this.phoneInput = "";
        this.addressInput = "";
        this.photos.forEach(p => URL.revokeObjectURL(p.preview));
        this.photos = [];
        this.showAddModal = false;

        if (res.data.success === 1) {
          showAlert({
            type: "success",
            messageKey: "entrySubmittedSuccess"
          });

          fetchOrders();
        } else {
          showAlert({
            type: "error",
            messageKey: "entrySubmittedError"
          });
        }
        console.log('response from submit: ')
        console.log(res.data?.data)
      } catch (err: any) {
        console.error("Upload failed:", err);
        alert(err.response?.data?.msg || "An error occurred while submitting entry.");
      } finally {
        this.isLoading = false;
        showLoading.hide();
      }
    }
  }
});
</script>

<style scoped>
main {
  height: calc(100vh - 128px);
  overflow: hidden;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
