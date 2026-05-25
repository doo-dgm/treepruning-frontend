<script setup lang="ts">
import { onMounted }       from 'vue'
import { storeToRefs }     from 'pinia'
import { useI18n }         from 'vue-i18n'
import { usePruningStore } from '@/presentation/stores/pruning.store'
import PhotoCapture        from '@/ui/components/PhotoCapture.vue'
import TreeMap             from '@/ui/components/TreeMap.vue'
import PruningDetailModal  from '@/ui/components/PruningDetailModal.vue'

const { t }   = useI18n()
const store   = usePruningStore()
const {
  statuses, trees, quadrilles, pruningTypes, prunings, sectors, loadingTrees,
  form, photoFiles,
  loadingForm, loadingList, submitting, successMsg, errorMsg, selectedTreeCoords,
  selectedPruning, selectedPruningPhotos, loadingPhotos, photoLoadError,
} = storeToRefs(store)

console.log('PruningManagement mounted, store refs:', {

  prunings: prunings,
})
onMounted(() => store.loadFormData())
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-4">{{ t('pruning.title') }}</h4>

    <div class="card mb-4">
      <div class="card-header fw-semibold">{{ t('pruning.newPruning') }}</div>
      <div class="card-body">

        <div v-if="loadingForm" class="text-center py-3">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ t('common.loading') }}</span>
          </div>
        </div>

        <form v-else @submit.prevent="store.submit">
          <div v-if="successMsg" class="alert alert-success py-2">{{ successMsg }}</div>
          <div v-if="errorMsg"   class="alert alert-danger  py-2">{{ errorMsg }}</div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.status') }}</label>
              <select v-model="form.status" class="form-select" required>
                <option value="" disabled>{{ t('pruning.form.statusPh') }}</option>
                <option v-for="s in statuses" :key="s.id" :value="s.id">
                  {{ s.name ?? s.nombre ?? s.id }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.type') }}</label>
              <select v-model="form.type" class="form-select" required>
                <option value="" disabled>{{ t('pruning.form.typePh') }}</option>
                <option v-for="pt in pruningTypes" :key="pt.id" :value="pt.id">
                  {{ pt.name ?? pt.nombre ?? pt.id }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.sector') }}</label>
              <select
                v-model="form.sector"
                class="form-select"
                required
                @change="store.loadTreesBySector(form.sector)"
              >
                <option value="" disabled>{{ t('pruning.form.sectorPh') }}</option>
                <option v-for="s in sectors" :key="s.id" :value="s.id">
                  {{ s.name ?? s.id }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.tree') }}</label>
              <select
                v-model="form.tree"
                class="form-select"
                required
                :disabled="!form.sector || loadingTrees"
                @change="store.selectTree(form.tree)"
              >
                <option value="" disabled>
                  {{ loadingTrees ? t('common.loading') : t('pruning.form.treePh') }}
                </option>
                <option v-for="tr in trees" :key="tr.id" :value="tr.id">
                  {{ tr.family?.commonName + ' ( Lat ' + tr.latitude + ', Lon ' + tr.longitude + ')' }}
                </option>
              </select>
            </div>

            <div class="col-12">
              <TreeMap
                :latitude="selectedTreeCoords?.lat ?? null"
                :longitude="selectedTreeCoords?.lng ?? null"
                :label="trees.find(t => t.id === form.tree)?.family?.commonName"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.quadrille') }}</label>
              <select v-model="form.quadrille" class="form-select" required>
                <option value="" disabled>{{ t('pruning.form.quadrillePh') }}</option>
                <option v-for="q in quadrilles" :key="q.id" :value="q.id">
                  {{ q.name ?? q.quadrilleName ?? q.id }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">{{ t('pruning.form.plannedDate') }}</label>
              <input v-model="form.plannedDate" type="date" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">
                {{ t('pruning.form.executedDateOptional') }}
              </label>
              <input v-model="form.executedDate" type="date" class="form-control" />
            </div>

            <div class="col-12">
              <label class="form-label">{{ t('pruning.form.photoOptional') }}</label>
              <PhotoCapture
                :files="photoFiles"
                :uploading="submitting"
                @add="store.addPhoto"
                @remove="store.removePhoto"
              />
            </div>

            <div class="col-12">
              <label class="form-label">{{ t('pruning.form.obsOptional') }}</label>
              <textarea v-model="form.observations" class="form-control" rows="2"></textarea>
            </div>

            <div class="col-12">
              <button type="submit" class="btn btn-success" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ submitting ? t('pruning.scheduling') : t('pruning.schedule') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-header fw-semibold">{{ t('pruning.registered') }}</div>
      <div class="card-body p-0">

        <div v-if="loadingList" class="text-center py-4">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ t('common.loading') }}</span>
          </div>
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
                <td>{{ p.plannedDate                    ?? t('common.empty') }}</td>
                <td>{{ p.executedDate                   ?? t('common.empty') }}</td>
                <td>{{ p.status?.name                   ?? t('common.empty') }}</td>
                <td>{{ p.tree?.family?.commonName       ?? t('common.empty') }}</td>
                <td>{{ p.quadrille?.quadrilleName       ?? t('common.empty') }}</td>
                <td>{{ p.type?.name                     ?? t('common.empty') }}</td>
                <td>{{ p.tree?.sector?.name             ?? t('common.empty') }}</td>
                <td>{{ p.observations                   || t('common.empty') }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-success btn-sm"
                    @click="store.openDetail(p)"
                  >
                    {{ t('pruning.detail.view') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <!-- Modal de detalle de poda -->
  <PruningDetailModal
    :pruning="selectedPruning"
    :photos="selectedPruningPhotos"
    :loading-photos="loadingPhotos"
    :photo-error="photoLoadError"
    @close="store.closeDetail()"
  />
</template>
