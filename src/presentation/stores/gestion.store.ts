import { defineStore }             from 'pinia'
import { ref }                     from 'vue'
import { GetGestionDataUseCase }   from '@/domain/gestion/GetGestionDataUseCase'
import { GestionRepositoryImpl }   from '@/data/repositories/GestionRepositoryImpl'
import type { EntityType, GestionRow } from '@/domain/gestion/GestionEntity'

// Instancia del caso de uso — el store no conoce los servicios directamente
const useCase = new GetGestionDataUseCase(new GestionRepositoryImpl())

export const useGestionStore = defineStore('gestion', () => {
  const selectedEntity = ref<EntityType>('personas')
  const columns        = ref<string[]>([])
  const rows           = ref<GestionRow[]>([])
  const loading        = ref(false)
  const error          = ref<string | null>(null)

  // Caché en memoria por entidad
  const cache = new Map<EntityType, { columns: string[]; rows: GestionRow[] }>()

  async function loadEntity(entity: EntityType) {
    selectedEntity.value = entity
    error.value          = null

    // Sirve desde caché si ya fue cargada
    if (cache.has(entity)) {
      const cached  = cache.get(entity)!
      columns.value = cached.columns
      rows.value    = cached.rows
      return
    }

    loading.value = true
    try {
      const result  = await useCase.execute(entity)
      cache.set(entity, result)
      columns.value = result.columns
      rows.value    = result.rows
    } catch (err) {
      error.value   = err instanceof Error ? err.message : 'Error desconocido'
      columns.value = []
      rows.value    = []
    } finally {
      loading.value = false
    }
  }

  return { selectedEntity, columns, rows, loading, error, loadEntity }
})
