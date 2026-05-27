<!-- src/ui/components/PhotoCapture.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  files: File[]       // archivos seleccionados (aun no subidos)
  uploading: boolean  // true durante el submit
}>()

const emit = defineEmits<{
  (e: 'add',    file:  File):   void
  (e: 'remove', index: number): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const previews = computed(() =>
  props.files.map(f => URL.createObjectURL(f))
)

function openPicker() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const selected = (event.target as HTMLInputElement).files
  if (!selected) return
  for (const file of Array.from(selected)) {
    emit('add', file)
  }
  // Resetea el input para poder agregar el mismo archivo de nuevo si el usuario lo desea
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="photo-capture">

    <!-- Input oculto — acepta multiples archivos -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="d-none"
      @change="onFileChange"
    />

    <!-- Lista de vistas previas -->
    <div v-if="files.length" class="photo-capture__grid mb-2">
      <div
        v-for="(src, i) in previews"
        :key="i"
        class="photo-capture__thumb"
      >
        <img :src="src" :alt="`Foto ${i + 1}`" class="photo-capture__img" />
        <button
          type="button"
          class="photo-capture__remove"
          :disabled="uploading"
          @click="emit('remove', i)"
          :title="t('pruning.form.removePhoto')"
        >
          &times;
        </button>
        <span v-if="uploading" class="photo-capture__badge">
          <span class="spinner-border spinner-border-sm"></span>
        </span>
      </div>
    </div>

    <!-- Boton agregar -->
    <button
      type="button"
      class="btn btn-outline-success btn-sm"
      :disabled="uploading"
      @click="openPicker"
    >
      {{ t('pruning.form.addPhoto') }}
    </button>

    <span v-if="files.length" class="ms-2 text-muted small">
      {{ files.length }} {{ files.length === 1 ? t('pruning.form.photoCount1') : t('pruning.form.photoCountN') }}
      &mdash; {{ t('pruning.form.photosPending') }}
    </span>

  </div>
</template>

<style scoped>
.photo-capture__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-capture__thumb {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  flex-shrink: 0;
}

.photo-capture__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-capture__remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-capture__remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-capture__badge {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
}
</style>
