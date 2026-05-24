<!-- src/ui/components/PhotoCapture.vue -->
<script setup lang="ts">
import { ref }     from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue:    string        // ruta devuelta por el backend
  uploading:     boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'capture', file: File): void
}>()

const cameraInput = ref<HTMLInputElement | null>(null)
const preview     = ref<string | null>(null)

function openCamera() {
  cameraInput.value?.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Preview local inmediato
  preview.value = URL.createObjectURL(file)

  // Emite el archivo para que el store lo suba
  emit('capture', file)
}
</script>

<template>
  <div class="photo-capture">

    <!-- Input oculto que abre la cámara -->
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="d-none"
      @change="onFileChange"
    />

    <!-- Preview de la foto tomada -->
    <div v-if="preview || modelValue" class="photo-capture__preview mb-2">
      <img
        :src="preview ?? modelValue"
        alt="Foto de la poda"
        class="photo-capture__img"
      />
    </div>

    <!-- Botón para abrir cámara -->
    <button
      type="button"
      class="btn btn-outline-success"
      :disabled="uploading"
      @click="openCamera"
    >
      <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
      <span v-else">📷</span>
      {{ uploading ? t('common.loading') : preview ? t('pruning.form.retakePhoto') : t('pruning.form.takePhoto') }}
    </button>

    <!-- Ruta guardada -->
    <div v-if="modelValue && !uploading" class="form-text text-success mt-1">
      ✓ {{ t('pruning.form.photoSaved') }}
    </div>

  </div>
</template>

<style scoped>
.photo-capture__preview {
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.photo-capture__img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
</style>
