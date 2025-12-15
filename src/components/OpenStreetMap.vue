<template>
  <div class="map-container">
    <div id="map" class="map"></div>

    <div class="info-panel" v-if="selectedTarget">
      <div>
        <strong>{{ selectedTarget.name }}</strong><br>
        📞 {{ selectedTarget.phone }}<br>
        Distance: {{ distance.toFixed(2) }} km
      </div>
      <button @click="clearLine" class="clear-btn">Clear Line</button>
    </div>

    <div class="zoom-controls">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue';
import { fetchMap, mapList } from '@/global/map.ts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map: L.Map;
let markersLayer: L.LayerGroup;
let userLayer: L.LayerGroup;
let lineLayer: L.Polyline | null = null;

const userLatLng = ref<L.LatLng | null>(null);
const selectedTarget = ref<any>(null);
const distance = ref<number>(0);

function createSVGDivIcon(color: string, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
  </svg>`;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;">${svg}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function clearLine() {
  if (lineLayer) {
    markersLayer.removeLayer(lineLayer);
    lineLayer = null;
    selectedTarget.value = null;
    distance.value = 0;
  }
}

function zoomIn() { map.zoomIn(); }
function zoomOut() { map.zoomOut(); }

onMounted(async () => {
  await nextTick();

  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  userLayer = L.layerGroup().addTo(map);

  // Current user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      userLatLng.value = L.latLng(lat, lng);
      map.setView([lat, lng], 14);

      L.marker([lat, lng], { icon: createSVGDivIcon('#3498DB', 48) })
        .addTo(userLayer)
        .bindPopup(`<b>You are here</b>`)
        .openPopup();
    });
  }

  // DB markers
  await fetchMap();
  mapList.value.forEach(item => {
    if (!item.latitude || !item.longitude) return;
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const marker = L.marker([lat, lng], { icon: createSVGDivIcon('#E74C3C', 40) })
      .addTo(markersLayer)
      .bindPopup(`<strong>${item.name ?? 'No name'}</strong><br/>📞 ${item.phone ?? '-'}`);

    marker.on('click', () => {
      if (!userLatLng.value) return;

      if (lineLayer) markersLayer.removeLayer(lineLayer);

      lineLayer = L.polyline([userLatLng.value, L.latLng(lat, lng)], {
        color: '#2980B9',
        weight: 4,
        dashArray: '6,4',
        opacity: 0.8,
      }).addTo(markersLayer);

      selectedTarget.value = item;
      distance.value = getDistanceKm(userLatLng.value.lat, userLatLng.value.lng, lat, lng);
      
      marker.bindPopup(`<strong>${item.name}</strong><br/>📞 ${item.phone ?? '-'}<br/>Distance: ${distance.value.toFixed(2)} km`).openPopup();
    });
  });
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 14px;
}

.clear-btn {
  margin-top: 8px;
  padding: 4px 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #c0392b;
}

.zoom-controls {
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.zoom-controls button {
  width: 36px;
  height: 36px;
  margin-bottom: 8px;
  font-size: 20px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.zoom-controls button:hover {
  background: #f0f0f0;
}
</style>
