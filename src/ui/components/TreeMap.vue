<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  latitude:  number | null
  longitude: number | null
  label?:    string
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map:    google.maps.Map    | null = null
let marker: google.maps.Marker | null = null

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve()

    const script    = document.createElement('script')
    script.src      = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    script.async    = true
    script.defer    = true
    script.onload   = () => resolve()
    document.head.appendChild(script)
  })
}

async function initMap() {
  if (!mapContainer.value || !props.latitude || !props.longitude) return

  await loadGoogleMaps()

  const position = { lat: props.latitude, lng: props.longitude }

  map = new google.maps.Map(mapContainer.value, {
    center:            position,
    zoom:              16,
    disableDefaultUI:  true,
    zoomControl:       true,
    mapTypeControl:    false,
    streetViewControl: false,
  })

  marker = new google.maps.Marker({
    position,
    map,
    title: props.label ?? 'Árbol',
    icon: {
      url:        'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      scaledSize: new google.maps.Size(40, 40),
    },
  })
}

function updateMarker() {
  if (!map || !marker || !props.latitude || !props.longitude) return
  const position = { lat: props.latitude, lng: props.longitude }
  marker.setPosition(position)
  map.panTo(position)
}

onMounted(() => initMap())

// Cuando cambia el árbol seleccionado actualiza el marcador
watch(() => [props.latitude, props.longitude], ([lat, lng]) => {
  if (lat && lng && map) {
    updateMarker()
  } else if (lat && lng) {
    initMap()
  }
})

onUnmounted(() => {
  marker?.setMap(null)
  map    = null
  marker = null
})
</script>

<template>
  <div
    v-if="latitude && longitude"
    ref="mapContainer"
    class="tree-map"
  />
  <div v-else class="tree-map tree-map--empty">
    <span class="text-muted">🌿 Selecciona un árbol para ver su ubicación</span>
  </div>
</template>

<style scoped>
.tree-map {
  width:         100%;
  height:        280px;
  border-radius: 10px;
  overflow:      hidden;
  border:        1px solid #dee2e6;
}

.tree-map--empty {
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      #f8f9fa;
}
</style>
