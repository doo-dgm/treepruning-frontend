<script setup>
import { ref, onMounted } from 'vue'
import { statusService, pqrService } from '@/data/services'

const statuses = ref([])
const loading = ref(false)
const submitting = ref(false)
const successMsg = ref(null)
const errorMsg = ref(null)

const form = ref({
  date: '',
  status: '',
  sector: '',
  risk: '',
  person: '',
  photographicRecordPath: '',
})

onMounted(async () => {
  loading.value = true
  try {
    const s = await statusService.getAll()
    statuses.value = s.data ?? []
  } catch (err) {
    errorMsg.value = `Error al cargar estados: ${err.message}`
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  successMsg.value = null
  errorMsg.value = null
  submitting.value = true
  try {
    const payload = {
      date: form.value.date || null,
      status: form.value.status || null,
      sector: form.value.sector || null,
      risk: form.value.risk || null,
      person: form.value.person || null,
      photographicRecordPath: form.value.photographicRecordPath || null,
    }
    await pqrService.submit(payload)
    successMsg.value = 'PQR enviada exitosamente.'
    form.value = { date: '', status: '', sector: '', risk: '', person: '', photographicRecordPath: '' }
  } catch (err) {
    errorMsg.value = `Error al enviar PQR: ${err.message}`
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-3">Peticiones, Quejas y Recursos (PQR)</h4>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <form v-else @submit.prevent="submit">
      <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Fecha</label>
          <input v-model="form.date" type="date" class="form-control" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Estado</label>
          <select v-model="form.status" class="form-select" required>
            <option value="" disabled>Seleccione un estado</option>
            <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name ?? s.nombre ?? s.id }}</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Sector <span class="text-muted">(UUID)</span></label>
          <input v-model="form.sector" type="text" class="form-control" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Riesgo <span class="text-muted">(UUID)</span></label>
          <input v-model="form.risk" type="text" class="form-control" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Persona <span class="text-muted">(UUID)</span></label>
          <input v-model="form.person" type="text" class="form-control" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Ruta del registro fotográfico <span class="text-muted">(opcional)</span></label>
          <input v-model="form.photographicRecordPath" type="text" class="form-control" placeholder="/fotos/pqr-001.jpg" />
        </div>

        <div class="col-12">
          <button type="submit" class="btn btn-success" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            Enviar PQR
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
