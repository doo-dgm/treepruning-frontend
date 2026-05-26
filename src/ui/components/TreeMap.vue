<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

export interface MapMarker {
  lat:    number
  lng:    number
  label?: string
}

const props = defineProps<{
  // Modo single (un arbol, hacia atras compatible)
  latitude?:  number | null
  longitude?: number | null
  label?:     string
  // Modo multi (lote de arboles)
  markers?:   MapMarker[]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map:      google.maps.Map    | null = null
let marker:   google.maps.Marker | null = null   // single-mode
let gMarkers: google.maps.Marker[]      = []     // multi-mode

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const isMultiMode  = () => Array.isArray(props.markers)
const isSingleMode = () => !isMultiMode() && !!props.latitude && !!props.longitude
const hasContent   = () => isMultiMode()
  ? (props.markers!.length > 0)
  : (!!props.latitude && !!props.longitude)

// ── Multi-marker helpers ──────────────────────────────────────────────────────

function clearMultiMarkers() {
  gMarkers.forEach(m => m.setMap(null))
  gMarkers = []
}

function renderMultiMarkers(list: MapMarker[]) {
  clearMultiMarkers()
  if (!map || list.length === 0) return

  const bounds = new google.maps.LatLngBounds()

  list.forEach((m, i) => {
    const pos = { lat: m.lat, lng: m.lng }
    const gm  = new google.maps.Marker({
      position: pos,
      map,
      title: m.label ?? `Árbol ${i + 1}`,
      icon: {
        url:        'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
    })
    gMarkers.push(gm)
    bounds.extend(pos)
  })

  if (list.length === 1) {
    map.setCenter({ lat: list[0].lat, lng: list[0].lng })
    map.setZoom(16)
  } else {
    map.fitBounds(bounds)
  }
}

// ── Map lifecycle ─────────────────────────────────────────────────────────────

async function initMap() {
  if (!mapContainer.value || !hasContent()) return
  if (map) return   // evitar doble-init

  await loadGoogleMaps()

  const center = isMultiMode()
    ? { lat: props.markers![0].lat, lng: props.markers![0].lng }
    : { lat: props.latitude!,       lng: props.longitude! }

  map = new google.maps.Map(mapContainer.value, {
    center,
    zoom:              16,
    disableDefaultUI:  true,
    zoomControl:       true,
    mapTypeControl:    false,
    streetViewControl: false,
  })

  if (isMultiMode()) {
    renderMultiMarkers(props.markers!)
  } else {
    marker = new google.maps.Marker({
      position: center,
      map,
      title: props.label ?? 'Árbol',
      icon: {
        url:        'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
    })
  }
}

function updateSingleMarker() {
  if (!map || !marker || !props.latitude || !props.longitude) return
  const position = { lat: props.latitude, lng: props.longitude }
  marker.setPosition(position)
  map.panTo(position)
}

function destroyMap() {
  clearMultiMarkers()
  marker = null
  map    = null
}

// ── Vue hooks ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  await nextTick()
  await initMap()
})

onUnmounted(() => {
  destroyMap()
})

// Single-mode: pan cuando cambian las coordenadas
watch(() => [props.latitude, props.longitude], async ([lat, lng]) => {
  if (!lat || !lng || isMultiMode()) return
  await nextTick()
  if (map) updateSingleMarker()
  else     await initMap()
})

// Multi-mode: re-renderizar cuando cambia la lista de marcadores
watch(() => props.markers, async (newMarkers) => {
  if (!Array.isArray(newMarkers)) return
  await nextTick()
  if (!map) {
    if (newMarkers.length > 0) await initMap()
  } else {
    renderMultiMarkers(newMarkers)
  }
}, { deep: true })
</script>

<template>
  <div
    v-if="hasContent()"
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
