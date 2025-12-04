<template>
  <div class="p-4 h-full overflow-y-auto bg-gray-100 hide-scrollbar">
    <!-- Delivery list -->
    <DeliveryList @dropOff="openDropOffModal" />

    <BottomSheet v-model:visible="showAddModal" :langClass="langStore.currentLang">

      <!-- Header -->
      <template #header>
        Drop Off: {{ selectedOrder?.customer }}
      </template>

      <!-- Body -->
      <template #body>
        <div class="space-y-4">

          <!-- Order Details -->
          <div class="p-3 bg-gray-100 rounded space-y-1">
            <div><strong>Order No:</strong> {{ selectedOrder?.id }}</div>
            <div><strong>Customer:</strong> {{ selectedOrder?.customer }}</div>
            <div><strong>Address:</strong> {{ selectedOrder?.address }}</div>
            <div><strong>COD:</strong> ${{ selectedOrder?.cod.toFixed(2) }}</div>
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

  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import enFlag from "@/assets/images/en.webp";
import khFlag from "@/assets/images/kh.webp";
import { useLangStore } from "@/store/langStore";
import langDataJson from "@/lang.json";
import { Icon } from "@iconify/vue";
import BottomSheet from "@/components/BottomSheet.vue";
import DeliveryList from "@/components/DeliveryList.vue";

import type { LangData } from "@/types/lang";

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
      photos: [] as PreviewFile[],
      enFlag,
      khFlag,
      isLoading: false,
      selectedOrder: null as any
    };
  },
  setup() {
    const langStore = useLangStore();
    const currentText = computed(() => langData[langStore.currentLang as keyof LangData]);
    return { langStore, currentText };
  },
  mounted() {
    const langStore = useLangStore();
    if (!langStore.currentLang) {
      langStore.switchLang("kh");
    }
  },
  methods: {
    openDropOffModal(order: any) {
      this.selectedOrder = order;
      this.showAddModal = true;
    },
    submitEntry() {
      console.log("Drop Off submitted for:", this.selectedOrder);
      this.showAddModal = false;
    },
    openCamera() {
      console.log("Camera opened");
    },
    openGallery() {
      console.log("Gallery opened");
    },
    removePhoto(index: number) {
      this.photos.splice(index, 1);
    }
  }
});
</script>

<style scoped>
/* Slide-up transition */
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

/* Fade transition */
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