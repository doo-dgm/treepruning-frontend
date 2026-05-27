<!-- src/ui/components/PruningDetailModal.vue -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Pruning } from '@/domain/pruning/PruningEntity'

const { t } = useI18n()

defineProps<{
  pruning:       Pruning | null
  photos:        string[]
  loadingPhotos: boolean
  photoError:    string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="pruning"
      class="modal d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);"
      @click.self="emit('close')"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">{{ t('pruning.detail.title') }}</h5>
            <button
              type="button"
              class="btn-close"
              :aria-label="t('pruning.detail.close')"
              @click="emit('close')"
            />
          </div>

          <div class="modal-body">
            <div class="row g-3">

              <!-- Estado y Tipo -->
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.status') }}</span>
                  <span class="detail-value">{{ pruning.status?.name ?? t('common.empty') }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.type') }}</span>
                  <span class="detail-value">{{ pruning.type?.name ?? t('common.empty') }}</span>
                </div>
              </div>

              <!-- Árbol y Familia -->
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.tree') }}</span>
                  <span class="detail-value">
                    {{ pruning.tree?.family?.commonName ?? t('common.empty') }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.family') }}</span>
                  <span class="detail-value">
                    <em>{{ pruning.tree?.family?.scientificName ?? t('common.empty') }}</em>
                  </span>
                </div>
              </div>

              <!-- Sector y Cuadrilla -->
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.sector') }}</span>
                  <span class="detail-value">
                    {{ pruning.tree?.sector?.name ?? t('common.empty') }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.quadrille') }}</span>
                  <span class="detail-value">
                    {{ pruning.quadrille?.quadrilleName ?? t('common.empty') }}
                  </span>
                </div>
              </div>

              <!-- Fechas -->
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.plannedDate') }}</span>
                  <span class="detail-value">{{ pruning.plannedDate ?? t('common.empty') }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.executedDate') }}</span>
                  <span class="detail-value">{{ pruning.executedDate ?? t('common.empty') }}</span>
                </div>
              </div>

              <!-- Observaciones -->
              <div class="col-12">
                <div class="detail-field">
                  <span class="detail-label">{{ t('pruning.detail.observations') }}</span>
                  <span class="detail-value">{{ pruning.observations || t('common.empty') }}</span>
                </div>
              </div>

              <!-- Evidencia fotográfica -->
              <div class="col-12">
                <p class="detail-label mb-2">{{ t('pruning.detail.photos') }}</p>

                <div v-if="loadingPhotos" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                  <span class="text-muted small">{{ t('pruning.detail.loadingPhotos') }}</span>
                </div>

                <div v-else-if="photoError" class="text-danger small">
                  {{ photoError }}
                </div>

                <div v-else-if="photos.length === 0" class="text-muted small">
                  {{ t('pruning.detail.noPhotos') }}
                </div>

                <div v-else class="photo-grid">
                  <a
                    v-for="(url, i) in photos"
                    :key="i"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="photo-thumb"
                    :title="`Foto ${i + 1}`"
                  >
                    <img :src="url" :alt="`Foto ${i + 1}`" class="photo-img" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              {{ t('pruning.detail.close') }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
}

.detail-value {
  font-size: 0.95rem;
  color: #212529;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.photo-thumb {
  display: block;
  width: 130px;
  height: 130px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.photo-thumb:hover {
  opacity: 0.85;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
