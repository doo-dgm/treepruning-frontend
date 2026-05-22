<script setup>
import { ref, onMounted } from 'vue'
import { statusService, treeService, quadrilleService, pruningTypeService, pruningService } from '@/data/services'

const statuses = ref([])
const trees = ref([])
const quadrilles = ref([])
const pruningTypes = ref([])
const prunings = ref([])

const loadingForm = ref(false)
const loadingList = ref(false)
const submitting = ref(false)
const successMsg = ref(null)
const errorMsg = ref(null)

const form = ref({
  status: '',
  plannedDate: '',
  executedDate: '',
  tree: '',
  quadrille: '',
  type: '',
  photographicRecordPath: '',
  observations: '',
})

const labelOf = (list, id, field) => {
  const item = list.find((i) => i.id === id)
  return item ? (item[field] ?? item.id) : id
}

onMounted(async () => {
  loadingForm.value = true
  loadingList.value = true
  try {
    const [s, t, q, pt, p] = await Promise.all([
      statusService.getAll(),
      treeService.getAll(),
      quadrilleService.getAll(),
      pruningTypeService.getAll(),
      pruningService.getAll(),
    ])
    statuses.value = s.data ?? []
    trees.value = t.data ?? []
    quadrilles.value = q.data ?? []
    pruningTypes.value = pt.data ?? []
    prunings.value = p.data ?? []
  } catch (err) {
    errorMsg.value = `Error al cargar datos: ${err.message}`
  } finally {
    loadingForm.value = false
    loadingList.value = false
  }
})

const refreshPrunings = async () => {
  const res = await pruningService.getAll()
  prunings.value = res.data ?? []
}

const submit = async () => {
  successMsg.value = null
  errorMsg.value = null
  submitting.value = true
  try {
    const payload = {
      status: form.value.status || null,
      plannedDate: form.value.plannedDate || null,
      executedDate: form.value.executedDate || null,
      tree: form.value.tree || null,
      quadrille: form.value.quadrille || null,
      type: form.value.type || null,
      photographicRecordPath: form.value.photographicRecordPath || null,
      observations: form.value.observations || null,
    }
    await pruningService.schedule(payload)
    successMsg.value = 'Poda programada exitosamente.'
    form.value = { status: '', plannedDate: '', executedDate: '', tree: '', quadrille: '', type: '', photographicRecordPath: '', observations: '' }
    await refreshPrunings()
  } catch (err) {
    errorMsg.value = `Error al programar poda: ${err.message}`
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-4">Gestión de Podas</h4>

    <!-- ── Formulario ── -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">Nueva poda</div>
      <div class="card-body">
        <div v-if="loadingForm" class="text-center py-3">
          <div class="spinner-border text-success" role="status"></div>
        </div>

        <form v-else @submit.prevent="submit">
          <div v-if="successMsg" class="alert alert-success py-2">{{ successMsg }}</div>
          <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select v-model="form.status" class="form-select" required>
                <option value="" disabled>Seleccione un estado</option>
                <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name ?? s.nombre ?? s.id }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Tipo de poda</label>
              <select v-model="form.type" class="form-select" required>
                <option value="" disabled>Seleccione un tipo</option>
                <option v-for="t in pruningTypes" :key="t.id" :value="t.id">{{ t.name ?? t.nombre ?? t.id }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Árbol</label>
              <select v-model="form.tree" class="form-select" required>
                <option value="" disabled>Seleccione un árbol</option>
                <option v-for="t in trees" :key="t.id" :value="t.id">{{ t.species ?? t.especie ?? t.id }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Cuadrilla</label>
              <select v-model="form.quadrille" class="form-select" required>
                <option value="" disabled>Seleccione una cuadrilla</option>
                <option v-for="q in quadrilles" :key="q.id" :value="q.id">{{ q.name ?? q.nombreCuadrilla ?? q.id }}</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Fecha planeada</label>
              <input v-model="form.plannedDate" type="date" class="form-control" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Fecha ejecutada <span class="text-muted">(opcional)</span></label>
              <input v-model="form.executedDate" type="date" class="form-control" />
            </div>

            <div class="col-12">
              <label class="form-label">Ruta fotográfica <span class="text-muted">(opcional)</span></label>
              <input v-model="form.photographicRecordPath" type="text" class="form-control" placeholder="/fotos/poda-001.jpg" />
            </div>

            <div class="col-12">
              <label class="form-label">Observaciones <span class="text-muted">(opcional)</span></label>
              <textarea v-model="form.observations" class="form-control" rows="2"></textarea>
            </div>

            <div class="col-12">
              <button type="submit" class="btn btn-success" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                Programar poda
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ── Lista de podas ── -->
    <div class="card">
      <div class="card-header fw-semibold">Podas registradas</div>
      <div class="card-body p-0">
        <div v-if="loadingList" class="text-center py-4">
          <div class="spinner-border text-success" role="status"></div>
        </div>

        <div v-else-if="prunings.length === 0" class="text-muted text-center py-4">
          No hay podas registradas.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Fecha planeada</th>
                <th>Fecha ejecutada</th>
                <th>Estado</th>
                <th>Árbol</th>
                <th>Cuadrilla</th>
                <th>Tipo</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in prunings" :key="p.id">
                <td>{{ p.plannedDate ?? '—' }}</td>
                <td>{{ p.executedDate ?? '—' }}</td>
                <td>{{ labelOf(statuses, p.status, 'name') }}</td>
                <td>{{ labelOf(trees, p.tree, 'species') }}</td>
                <td>{{ labelOf(quadrilles, p.quadrille, 'name') }}</td>
                <td>{{ labelOf(pruningTypes, p.type, 'name') }}</td>
                <td>{{ p.observations || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
