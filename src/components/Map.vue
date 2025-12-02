<template>
  <div class="w-full h-full">
    <GMapMap
      class="h-full"
      :center="center"
      :zoom="15"
      style="width: 100%; height: 100%"
      @click="onMapClick"
    >
      <!-- Draggable Marker -->
      <GMapMarker
        :position="center"
        :draggable="true"
        @dragend="onMarkerDragEnd"
      />
    </GMapMap>
  </div>
</template>

<script>
export default {
  name: "Map",
  data() {
    return {
      center: { lat: 11.5564, lng: 104.9282 }, // default if geolocation fails
    };
  },
  mounted() {
    // Get current user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (err) => {
          console.warn("Geolocation failed, using default:", err);
        }
      );
    }
  },
  methods: {
    // Move marker when map is clicked
    onMapClick(event) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.center = { lat, lng };
    },
    // Move marker when dragged
    onMarkerDragEnd(event) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.center = { lat, lng };
    },
  },
};
</script>
