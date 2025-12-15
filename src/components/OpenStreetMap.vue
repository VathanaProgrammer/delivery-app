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

// Inline SVG for Iconify icon
function createSVGDivIcon(svg: string, size = 32) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;">${svg}</div>`,
    className: '', // remove default styles
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Example SVG (mdi:map-marker)
const mapMarkerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff0000"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`;

onMounted(async () => {
  await nextTick();

  // Init map
  map = L.map('map').setView([11.5564, 104.9282], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Fetch DB data
  await fetchMap();

  // Add markers from DB using SVG DivIcon
  mapList.value.forEach(item => {
    if (!item.latitude || !item.longitude) return;

    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    const icon = createSVGDivIcon(mapMarkerSVG, 32);

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

    const icon = createSVGDivIcon(mapMarkerSVG, 32);

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
  height: 100vh;
}
</style>
