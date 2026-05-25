import { defineStore } from 'pinia'
import { ref }         from 'vue'
import {
  getPruningFormDataUseCase,
  schedulePruningUseCase,
  getPruningsUseCase,
  getTreesBySectorUseCase,
} from '@/data/composition/pruning.composition'
import { photoService } from '@/data/services/photo.service'

import { emptyForm }                             from '@/domain/pruning/PruningEntity'
import type { Pruning, LookupItem, PruningForm, TreeLookupItem } from '@/domain/pruning/PruningEntity'

export const usePruningStore = defineStore('pruning', () => {

  const statuses     = ref<LookupItem[]>([])
  const trees = ref<TreeLookupItem[]>([])
  const quadrilles   = ref<LookupItem[]>([])
  const pruningTypes = ref<LookupItem[]>([])
  const prunings     = ref<Pruning[]>([])
  const sectors      = ref<LookupItem[]>([])
  const selectedTreeCoords = ref<{ lat: number; lng: number } | null>(null)

  const form = ref<PruningForm>(emptyForm())

  // Archivos seleccionados localmente — se suben al hacer submit, no antes
  const photoFiles = ref<File[]>([])

  const loadingForm  = ref(false)
  const loadingList  = ref(false)
  const submitting   = ref(false)
  const loadingTrees = ref(false)
  const successMsg   = ref<string | null>(null)
  const errorMsg     = ref<string | null>(null)

  // Estado del modal de detalle
  const selectedPruning       = ref<Pruning | null>(null)
  const selectedPruningPhotos = ref<string[]>([])
  const loadingPhotos         = ref(false)
  const photoLoadError        = ref<string | null>(null)

  async function loadFormData() {
    loadingForm.value = true
    loadingList.value = true
    errorMsg.value    = null
    try {
      const data         = await getPruningFormDataUseCase.execute()
      statuses.value     = data.statuses
      trees.value        = data.trees
      quadrilles.value   = data.quadrilles
      pruningTypes.value = data.pruningTypes
      prunings.value     = data.prunings
      sectors.value      = data.sectors
    } catch (err) {
      errorMsg.value = err instanceof Error
        ? `Error al cargar datos: ${err.message}`
        : 'Error desconocido'
    } finally {
      loadingForm.value = false
      loadingList.value = false
    }
  }

  async function loadTreesBySector(sectorId: string) {
  if (!sectorId) {
    trees.value      = []
    form.value.tree  = ''
    return
  }
  loadingTrees.value = true
  try {
    trees.value     = await getTreesBySectorUseCase.execute(sectorId)
    form.value.tree = ''   // resetea el árbol seleccionado al cambiar sector
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Error al cargar árboles'
    trees.value    = []
  } finally {
    loadingTrees.value = false
  }
}

  async function refreshPrunings() {
    try {
      prunings.value = await getPruningsUseCase.execute()
    } catch (err) {
      errorMsg.value = err instanceof Error ? err.message : 'Error al refrescar podas'
    }
  }

  async function submit() {
    successMsg.value = null
    errorMsg.value   = null
    submitting.value = true
    try {
      // Subir fotos pendientes antes de programar la poda
      if (photoFiles.value.length > 0) {
        const paths: string[] = []
        for (const file of photoFiles.value) {
          const res = await photoService.upload(file)
          paths.push(res.data.data.path)
        }
        form.value.photographicRecordPath = paths.join(',')
      }

      await schedulePruningUseCase.execute(form.value)
      successMsg.value = 'Poda programada exitosamente.'
      form.value       = emptyForm()
      photoFiles.value = []
      await refreshPrunings()
    } catch (err) {
      errorMsg.value = err instanceof Error
        ? `Error al programar poda: ${err.message}`
        : 'Error desconocido'
    } finally {
      submitting.value = false
    }
  }

  function addPhoto(file: File) {
    photoFiles.value = [...photoFiles.value, file]
  }

  function removePhoto(index: number) {
    photoFiles.value = photoFiles.value.filter((_, i) => i !== index)
  }

  async function openDetail(pruning: Pruning) {
    selectedPruning.value       = pruning
    selectedPruningPhotos.value = []
    photoLoadError.value        = null

    if (pruning.photographicRecordPath) {
      loadingPhotos.value = true
      try {
        const res = await photoService.getUrls(pruning.id)
        selectedPruningPhotos.value = res.data.data?.urls ?? []
      } catch {
        photoLoadError.value = 'Error al cargar imágenes'
      } finally {
        loadingPhotos.value = false
      }
    }
  }

  function closeDetail() {
    selectedPruning.value       = null
    selectedPruningPhotos.value = []
    photoLoadError.value        = null
  }

  function selectTree(treeId: string) {
    const tree = trees.value.find(t => t.id === treeId)
    if (tree?.latitude && tree?.longitude) {
      selectedTreeCoords.value = { lat: tree.latitude, lng: tree.longitude }
      console.log('coords guardadas →', selectedTreeCoords.value)
    } else {
      selectedTreeCoords.value = null
    }
  }

  return {
    statuses, trees, quadrilles, pruningTypes, prunings, sectors,
    form, photoFiles,
    loadingForm, loadingList, submitting, loadingTrees, successMsg, errorMsg,
    selectedTreeCoords, selectTree,
    selectedPruning, selectedPruningPhotos, loadingPhotos, photoLoadError,
    loadFormData, loadTreesBySector, submit, addPhoto, removePhoto,
    openDetail, closeDetail,
  }
})
