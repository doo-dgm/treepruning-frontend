<!-- src/ui/views/GestionView.vue -->
<script setup lang="ts">
import { onMounted, watch }    from 'vue'
import { storeToRefs }         from 'pinia'
import { useGestionStore }     from '@/presentation/stores/gestion'
import type { EntityType }     from '@/domain/gestion/GestionEntity'

const store = useGestionStore()
const { selectedEntity, columns, rows, loading, error } = storeToRefs(store)

onMounted(() => store.loadEntity(selectedEntity.value))
watch(selectedEntity, (entity) => store.loadEntity(entity))
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-3">Gestion de informacion</h4>

    <select v-model="selectedEntity" class="form-select mb-3">
      <option value="personas">Personas</option>
      <option value="sector">Sectores</option>
      <option value="familia">Familia de arboles</option>
      <option value="arbol">Arboles</option>
      <option value="herramienta">Herramientas</option>
      <option value="cuadrilla">Cuadrillas</option>
      <option value="estado">Estados</option>
      <option value="tipo">Tipos de poda</option>
    </select>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Error al cargar datos: {{ error }}
    </div>

    <div v-else-if="rows.length === 0" class="alert alert-info">
      No hay registros disponibles.
    </div>

    <table v-else class="table table-striped table-bordered table-hover">
      <thead class="table-dark">
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="col in columns" :key="col">{{ row[col] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
