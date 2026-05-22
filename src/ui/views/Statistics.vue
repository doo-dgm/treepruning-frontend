<script setup>
import { ref, onMounted } from 'vue'
import { treeService, quadrilleService, statusService, pruningTypeService } from '@/data/services'

const cards = ref([
  { label: 'Árboles registrados',   icon: '🌳', count: null, color: '#1abc9c', error: false },
  { label: 'Cuadrillas activas',    icon: '👷', count: null, color: '#3498db', error: false },
  { label: 'Estados definidos',     icon: '📌', count: null, color: '#9b59b6', error: false },
  { label: 'Tipos de poda',         icon: '✂️', count: null, color: '#e67e22', error: false },
])

onMounted(async () => {
  const fetchers = [
    treeService.getAll(),
    quadrilleService.getAll(),
    statusService.getAll(),
    pruningTypeService.getAll(),
  ]

  const results = await Promise.allSettled(fetchers)

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      cards.value[i].count = (result.value.data ?? []).length
    } else {
      cards.value[i].error = true
    }
  })
})
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-1">Estadísticas</h4>
    <p class="text-muted mb-4">Resumen general del sistema</p>

    <div class="row g-3">
      <div v-for="card in cards" :key="card.label" class="col-sm-6 col-xl-3">
        <div class="stat-card" :style="{ borderLeftColor: card.color }">
          <div class="stat-card__icon" :style="{ color: card.color }">{{ card.icon }}</div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              <span v-if="card.error" class="text-danger">—</span>
              <span v-else-if="card.count === null" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else>{{ card.count }}</span>
            </div>
            <div class="stat-card__label">{{ card.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="info-box">
          <p class="text-muted mb-0">
            Próximamente: gráficas de podas por mes, distribución por sector y estado de PQRs.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: #ffffff;
  border-radius: 10px;
  border-left: 4px solid;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.stat-card__icon {
  font-size: 2rem;
  line-height: 1;
}

.stat-card__value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  color: #1a2635;
}

.stat-card__label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 4px;
}

.info-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px 20px;
  border: 1px solid #e9ecef;
}
</style>
