import { defineStore } from 'pinia'
import { ref }         from 'vue'
import {
  getPruningFormDataUseCase,
  schedulePruningUseCase,
  getPruningsUseCase,
} from '@/data/composition/pruning.composition'
import { emptyForm }                             from '@/domain/pruning/PruningEntity'
import type { Pruning, LookupItem, PruningForm } from '@/domain/pruning/PruningEntity'
import { getTreesBySectorUseCase } from '@/data/composition/pruning.composition'
import { uploadPhotoUseCase } from '@/data/composition/pruning.composition'

export const usePruningStore = defineStore('pruning', () => {

  const statuses     = ref<LookupItem[]>([])
  const trees        = ref<LookupItem[]>([])
  const quadrilles   = ref<LookupItem[]>([])
  const pruningTypes = ref<LookupItem[]>([])
  const prunings     = ref<Pruning[]>([])
  const sectors      = ref<LookupItem[]>([])

  const form = ref<PruningForm>(emptyForm())

  const loadingForm = ref(false)
  const loadingList = ref(false)
  const submitting  = ref(false)
  const loadingTrees = ref(false)
  const successMsg  = ref<string | null>(null)
  const errorMsg    = ref<string | null>(null)

  const uploadingPhoto = ref(false)

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
      await schedulePruningUseCase.execute(form.value)
      successMsg.value = 'Poda programada exitosamente.'
      form.value       = emptyForm()
      await refreshPrunings()
    } catch (err) {
      errorMsg.value = err instanceof Error
        ? `Error al programar poda: ${err.message}`
        : 'Error desconocido'
    } finally {
      submitting.value = false
    }
  }


  async function uploadPhoto(file: File) {
    uploadingPhoto.value = true
    try {
      form.value.photographicRecordPath = await uploadPhotoUseCase.execute(file)
    } catch (err) {
      errorMsg.value = err instanceof Error ? err.message : 'Error al subir foto'
    } finally {
      uploadingPhoto.value = false
    }
  }

  return {
    statuses, trees, quadrilles, pruningTypes, prunings, sectors,
    form,
    loadingForm, loadingList, submitting, loadingTrees, successMsg, errorMsg,
    loadFormData, loadTreesBySector, submit, uploadingPhoto, uploadPhoto
  }
})
