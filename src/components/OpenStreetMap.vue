<template>
  <div id="map" class="map"></div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue';
import { fetchMap, mapList } from '@/global/map.ts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map: L.Map;
let markersLayer: L.LayerGroup;
const userLatLng = ref<L.LatLng | null>(null);

// Inline SVG for markers
function createSVGDivIcon(svg: string, size = 32) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;">${svg}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const mapMarkerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff0000">
<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
</svg>`;

// Calculate distance in km between two points
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

onMounted(async () => {
  await nextTick();

  map = L.map('map').setView([0,0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Get current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      userLatLng.value = L.latLng(lat, lng);

      map.setView([lat, lng], 13);

      const currentIcon = createSVGDivIcon(mapMarkerSVG, 40);
      L.marker([lat, lng], { icon: currentIcon })
        .addTo(markersLayer)
        .bindPopup('You are here')
        .openPopup();

      // After user location, fetch markers and draw lines
      renderMarkersAndLines();
    });
  } else {
    // If geolocation fails, still render markers
    renderMarkersAndLines();
  }
});

async function renderMarkersAndLines() {
  await fetchMap();
  mapList.value.forEach(item => {
    if (!item.latitude || !item.longitude) return;
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const icon = createSVGDivIcon(mapMarkerSVG, 32);
    const marker = L.marker([lat, lng], { icon })
      .addTo(markersLayer)
      .bindPopup(`<strong>${item.name ?? 'No name'}</strong><br/>📞 ${item.phone ?? '-'}`);

    // Draw line from user to marker if user location exists
    if (userLatLng.value) {
      const line = L.polyline([userLatLng.value, L.latLng(lat, lng)], {
        color: 'blue',
        weight: 3,
        dashArray: '5,5'
      }).addTo(markersLayer);

      const distance = getDistanceKm(userLatLng.value.lat, userLatLng.value.lng, lat, lng).toFixed(2);
      marker.bindPopup(`<strong>${item.name ?? 'No name'}</strong><br/>📞 ${item.phone ?? '-'}<br/>Distance: ${distance} km`);
    }
  });
}
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>
