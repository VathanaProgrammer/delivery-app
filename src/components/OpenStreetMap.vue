<template>
  <div id="map" class="map"></div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { fetchMap, mapList } from '@/global/map.ts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let map: L.Map;
let markersLayer: L.LayerGroup;

onMounted(async () => {
  await nextTick();
  // Fix Leaflet icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });

  // Init map
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

    L.marker([lat, lng])
      .addTo(markersLayer)
      .bindPopup(`
        <strong>${item.name ?? 'No name'}</strong><br/>
        📞 ${item.phone ?? '-'}
      `);
  });

  // Optional: click to add temporary marker
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    L.marker([lat, lng])
      .addTo(markersLayer)
      .bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .openPopup();
  });
});
</script>
