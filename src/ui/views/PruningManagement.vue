<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs }              from 'pinia'
import { useI18n }                  from 'vue-i18n'
import { usePruningStore }          from '@/presentation/stores/pruning.store'
import PhotoCapture                 from '@/ui/components/PhotoCapture.vue'
import TreeMap                      from '@/ui/components/TreeMap.vue'
import PruningDetailModal           from '@/ui/components/PruningDetailModal.vue'
import type { MapMarker }           from '@/ui/components/TreeMap.vue'

const { t } = useI18n()
const store = usePruningStore()

const {
  // catalogos
  trees, quadrilles, prunings, sectors, loadingTrees,
  photoFiles, loadingForm, loadingList, preventiveSubmitting,
  // poda preventiva
  preventiveForm, selectedPreventiveTrees, preventiveSuccessMsg, preventiveErrorMsg,
  // detalle
  selectedPruning, selectedPruningPhotos, loadingPhotos, photoLoadError,
} = storeToRefs(store)

// ── Estado de la vista ────────────────────────────────────────────────────────

const showPreventiveForm = ref(false)
const selectedTreeId     = ref('')   // selector temporal antes de "Agregar"

// Arbol seleccionado en el dropdown (aun no anadido)
const pendingTree = computed(() =>
  trees.value.find(t => t.id === selectedTreeId.value) ?? null
)

// Marcadores para el mapa multi-arbol
const preventiveMarkers = computed<MapMarker[]>(() =>
  selectedPreventiveTrees.value.map(t => ({ lat: t.lat, lng: t.lng, label: t.label }))
)

// ── Acciones ──────────────────────────────────────────────────────────────────

onMounted(() => store.loadFormData())

function openPreventiveForm() {
  store.resetPreventiveForm()
  selectedTreeId.value = ''
  showPreventiveForm.value = true
}

function cancelPreventiveForm() {
  store.resetPreventiveForm()
  selectedTreeId.value = ''
  showPreventiveForm.value = false
}

function handleAddTree() {
  if (!selectedTreeId.value) return
  store.addTreeToPreventive(selectedTreeId.value)
  selectedTreeId.value = ''
}

async function handleSubmitPreventive() {
  await store.submitPreventive()
  if (preventiveSuccessMsg.value) {
    showPreventiveForm.value = false
  }
}
</script>

<template>
  <div class="container mt-4">

    <!-- ── Encabezado + acciones ─────────────────────────────────────────── -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <h4 class="mb-0">{{ t('pruning.title') }}</h4>
      <div class="d-flex gap-2">
        <button
          class="btn btn-success"
          :disabled="showPreventiveForm"
          @click="openPreventiveForm"
        >
          {{ t('pruning.preventive.btnCreate') }}
        </button>
        <button class="btn btn-outline-secondary" disabled title="Proximamente">
          {{ t('pruning.preventive.btnCorrective') }}
          <span class="badge bg-secondary ms-1 fw-normal">{{ t('pruning.preventive.soon') }}</span>
        </button>
      </div>
    </div>

    <!-- ── Formulario poda preventiva ────────────────────────────────────── -->
    <div v-if="showPreventiveForm" class="card mb-4 border-success">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <span class="fw-semibold">{{ t('pruning.preventive.title') }}</span>
        <button type="button" class="btn-close btn-close-white" @click="cancelPreventiveForm" />
      </div>
      <div class="card-body">

        <div v-if="loadingForm" class="text-center py-3">
          <div class="spinner-border text-success" role="status" />
        </div>

        <form v-else @submit.prevent="handleSubmitPreventive">

          <div class="row g-3">

            <!-- Selector de sector + arbol -->
            <div class="col-md-5">
              <label for="sector-select" class="form-label">{{ t('pruning.preventive.sector') }}</label>
              <select
                id="sector-select"
                v-model="preventiveForm.sector"
                class="form-select"
                @change="store.loadTreesBySector(preventiveForm.sector)"
              >
                <option value="" disabled>{{ t('pruning.preventive.sectorPh') }}</option>
                <option v-for="s in sectors" :key="s.id" :value="s.id">
                  {{ s.name ?? s.id }}
                </option>
              </select>
            </div>

            <div class="col-md-5">
              <label for="tree-select" class="form-label">{{ t('pruning.preventive.treeSelect') }}</label>
              <select
                id="tree-select"
                v-model="selectedTreeId"
                class="form-select"
                :disabled="!preventiveForm.sector || loadingTrees"
              >
                <option value="" disabled>
                  {{ loadingTrees ? t('common.loading') : t('pruning.preventive.treePh') }}
                </option>
                <option
                  v-for="tr in trees"
                  :key="tr.id"
                  :value="tr.id"
                  :disabled="selectedPreventiveTrees.some(s => s.id === tr.id)"
                >
                  {{ tr.family?.commonName ?? tr.id }}
                  ({{ tr.latitude?.toFixed(4) }}, {{ tr.longitude?.toFixed(4) }})
                </option>
              </select>
            </div>

            <div class="col-md-2 d-flex align-items-end">
              <button
                type="button"
                class="btn btn-outline-success w-100"
                :disabled="!selectedTreeId"
                @click="handleAddTree"
              >
                {{ t('pruning.preventive.addTree') }}
              </button>
            </div>

            <!-- Chips de arboles seleccionados -->
            <div class="col-12">
              <label class="form-label fw-semibold">
                {{ t('pruning.preventive.treesSection') }}
                <span class="badge bg-success ms-1">{{ selectedPreventiveTrees.length }}</span>
              </label>
              <div v-if="selectedPreventiveTrees.length === 0" class="text-muted small">
                {{ t('pruning.preventive.noTrees') }}
              </div>
              <div v-else class="d-flex flex-wrap gap-2">
                <span
                  v-for="entry in selectedPreventiveTrees"
                  :key="entry.id"
                  class="badge bg-success-subtle text-success-emphasis border border-success-subtle d-flex align-items-center gap-1 px-2 py-1"
                  style="font-size:0.82rem"
                >
                  {{ entry.label }}
                  <button
                    type="button"
                    class="btn-close btn-close"
                    style="font-size:0.6rem"
                    :title="t('pruning.preventive.removeTree')"
                    @click="store.removeTreeFromPreventive(entry.id)"
                  />
                </span>
              </div>
            </div>

            <!-- Mapa multi-arbol -->
            <div class="col-12">
              <TreeMap :markers="preventiveMarkers" />
            </div>

            <!-- Fecha planeada + Cuadrilla -->
            <div class="col-md-6">
              <label for="planned-date" class="form-label">{{ t('pruning.preventive.plannedDate') }}</label>
              <input id="planned-date" v-model="preventiveForm.plannedDate" type="date" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label for="quadrille-select" class="form-label">{{ t('pruning.preventive.quadrille') }}</label>
              <select id="quadrille-select" v-model="preventiveForm.quadrille" class="form-select" required>
                <option value="" disabled>{{ t('pruning.preventive.quadrillePh') }}</option>
                <option v-for="q in quadrilles" :key="q.id" :value="q.id">
                  {{ (q as any).quadrilleName ?? q.name ?? q.id }}
                </option>
              </select>
            </div>

            <!-- Fotos (opcional) -->
            <div class="col-12">
              <label class="form-label">{{ t('pruning.preventive.photo') }}</label>
              <PhotoCapture
                :files="photoFiles"
                :uploading="preventiveSubmitting"
                @add="store.addPhoto"
                @remove="store.removePhoto"
              />
            </div>

            <!-- Observaciones (opcional) -->
            <div class="col-12">
              <label for="observations" class="form-label">{{ t('pruning.preventive.observations') }}</label>
              <textarea id="observations" v-model="preventiveForm.observations" class="form-control" rows="2" />
            </div>

            <!-- Botones -->
            <div class="col-12 d-flex gap-2">
              <button
                type="submit"
                class="btn btn-success"
                :disabled="preventiveSubmitting || selectedPreventiveTrees.length === 0 || !preventiveForm.plannedDate || !preventiveForm.quadrille"
              >
                <span v-if="preventiveSubmitting" class="spinner-border spinner-border-sm me-1" />
                {{ preventiveSubmitting
                    ? t('pruning.preventive.submitting')
                    : t('pruning.preventive.submit', { count: selectedPreventiveTrees.length }) }}
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                :disabled="preventiveSubmitting"
                @click="cancelPreventiveForm"
              >
                {{ t('pruning.preventive.cancel') }}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>

    <!-- ── Tabla de podas registradas ─────────────────────────────────────── -->
    <div class="card">
      <div class="card-header fw-semibold">{{ t('pruning.registered') }}</div>
      <div class="card-body p-0">

        <div v-if="loadingList" class="text-center py-4">
          <div class="spinner-border text-success" role="status" />
        </div>

        <div v-else-if="prunings.length === 0" class="text-muted text-center py-4">
          {{ t('pruning.noRecords') }}
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>{{ t('pruning.table.plannedDate')  }}</th>
                <th>{{ t('pruning.table.executedDate') }}</th>
                <th>{{ t('pruning.table.status')       }}</th>
                <th>{{ t('pruning.table.tree')         }}</th>
                <th>{{ t('pruning.table.quadrille')    }}</th>
                <th>{{ t('pruning.table.type')         }}</th>
                <th>{{ t('pruning.table.sector')       }}</th>
                <th>{{ t('pruning.table.observations') }}</th>
                <th>{{ t('pruning.table.actions')      }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in prunings" :key="p.id">
                <td>{{ p.plannedDate              ?? t('common.empty') }}</td>
                <td>{{ p.executedDate             ?? t('common.empty') }}</td>
                <td>{{ p.status?.name             ?? t('common.empty') }}</td>
                <td>{{ p.tree?.family?.commonName ?? t('common.empty') }}</td>
                <td>{{ (p.quadrille as any)?.quadrilleName ?? p.quadrille?.name ?? t('common.empty') }}</td>
                <td>{{ p.type?.name               ?? t('common.empty') }}</td>
                <td>{{ p.tree?.sector?.name       ?? t('common.empty') }}</td>
                <td>{{ p.observations             || t('common.empty') }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-success btn-sm"
                    @click="store.openDetail(p)"
                  >
                    {{ t('pruning.detail.view') }}
                  </button>
                  console.log('Detalle de poda', p) <!-- TODO: eliminar -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  </div>

  <!-- Modal de detalle -->
  <PruningDetailModal
    :pruning="selectedPruning"
    :photos="selectedPruningPhotos"
    :loading-photos="loadingPhotos"
    :photo-error="photoLoadError"
    @close="store.closeDetail()"
  />
</template>
