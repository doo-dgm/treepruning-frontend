<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { config } from '@/infra/config'

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
let map:      google.maps.Map                                   | null = null
let marker:   google.maps.marker.AdvancedMarkerElement          | null = null   // single-mode
let gMarkers: google.maps.marker.AdvancedMarkerElement[]               = []     // multi-mode

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.marker) return resolve()
    const script    = document.createElement('script')
    script.src      = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=marker`
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
  gMarkers.forEach(m => { m.map = null })
  gMarkers = []
}

function renderMultiMarkers(list: MapMarker[]) {
  clearMultiMarkers()
  if (!map || list.length === 0) return

  const bounds = new google.maps.LatLngBounds()

  list.forEach((m, i) => {
    const pos = new google.maps.LatLng(m.lat, m.lng)

    const pin = new google.maps.marker.PinElement({
      background:  '#198754',
      borderColor: '#145c38',
      glyphColor:  '#ffffff',
    })

    const gm = new google.maps.marker.AdvancedMarkerElement({
      position: pos,
      map,
      title:   m.label ?? `Árbol ${i + 1}`,
      content: pin.element,
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

  // mapId es obligatorio para AdvancedMarkerElement.
  // Usa tu Map ID de Google Cloud Console en produccion;
  // DEMO_MAP_ID funciona en desarrollo sin configuracion adicional.
  map = new google.maps.Map(mapContainer.value, {
    center,
    zoom:              16,
    mapId:             (config.googleMapsMapId && !config.googleMapsMapId.startsWith('__')) ? config.googleMapsMapId : 'DEMO_MAP_ID',
    disableDefaultUI:  true,
    zoomControl:       true,
    mapTypeControl:    false,
    streetViewControl: false,
  })

  if (isMultiMode()) {
    renderMultiMarkers(props.markers!)
  } else {
    const pin = new google.maps.marker.PinElement({
      background:  '#198754',
      borderColor: '#145c38',
      glyphColor:  '#ffffff',
    })
    marker = new google.maps.marker.AdvancedMarkerElement({
      position: center,
      map,
      title:   props.label ?? 'Árbol',
      content: pin.element,
    })
  }
}

function updateSingleMarker() {
  if (!map || !marker || !props.latitude || !props.longitude) return
  const position = { lat: props.latitude, lng: props.longitude }
  marker.position = position
  map.panTo(position)
}

function destroyMap() {
  clearMultiMarkers()
  if (marker) { marker.map = null; marker = null }
  map = null
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

  if (newMarkers.length === 0) {
    // Lista vaciada (reset del formulario): liberar instancia ahora.
    // v-if retira el contenedor del DOM pero NO dispara onUnmounted,
    // por lo que sin esta llamada map quedaria no-null y el siguiente
    // initMap() retornaria sin hacer nada, dejando el div en blanco.
    destroyMap()
    return
  }

  if (!map) {
    await initMap()
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
