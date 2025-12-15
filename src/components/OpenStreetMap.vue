<template>
  <div id="map" class="map"></div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { fetchMap, mapList } from '@/global/map.ts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map: L.Map;
let markersLayer: L.LayerGroup;

// Function to create a Leaflet icon from Iconify SVG
function createIconifyIcon(iconName: string, size = 32, color = '#ff0000') {
  return L.icon({
    iconUrl: `https://api.iconify.design/${iconName}.svg?color=${encodeURIComponent(color)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // bottom-center
    popupAnchor: [0, -size],
  });
}

onMounted(async () => {
  await nextTick();

  // Initialize map
  map = L.map('map').setView([11.5564, 104.9282], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Fetch DB data
  await fetchMap();

  // Add markers from DB
  mapList.value.forEach(item => {
    if (!item.latitude || !item.longitude) return;

    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    const icon = createIconifyIcon('mdi:map-marker', 32, '#007bff');

    L.marker([lat, lng], { icon })
      .addTo(markersLayer)
      .bindPopup(`
        <strong>${item.name ?? 'No name'}</strong><br/>
        📞 ${item.phone ?? '-'}
      `);
  });

  // Click to add temporary marker
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    const icon = createIconifyIcon('mdi:map-marker', 32, '#28a745');

    L.marker([lat, lng], { icon })
      .addTo(markersLayer)
      .bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .openPopup();
  });
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh; /* full screen */
}
</style>
