import { defineStore }    from 'pinia'
import { ref }            from 'vue'
import {
  getPruningFormDataUseCase,
  schedulePruningUseCase,
  getPruningsUseCase,
  getTreesBySectorUseCase,
  uploadPhotoUseCase,
  schedulePreventiveUseCase,
} from '@/data/composition/pruning.composition'
import { showBrowserNotification } from '@/infra/notifications/showBrowserNotification'
import { addNotification }         from '@/presentation/composables/useNotifications'
import { resolveErrorMessage }     from '@/infra/errors/errorMessages'
import { photoService } from '@/data/services/photo.service'
import { i18n } from '@/infra/i18n'

import { emptyForm, emptyBatchForm }             from '@/domain/pruning/PruningEntity'
import type {
  Pruning, LookupItem, PruningForm, TreeLookupItem,
  PreventiveBatchForm, SelectedTreeEntry,
} from '@/domain/pruning/PruningEntity'

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
      form.value.tree = ''   // resetea el arbol seleccionado al cambiar sector
    } catch (err) {
      errorMsg.value = err instanceof Error ? err.message : 'Error al cargar arboles'
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
          const path = await uploadPhotoUseCase.execute(file)
          if (!path) throw new Error('La foto no retorno una ruta valida.')
          paths.push(path)
        }
        form.value.photographicRecordPath = paths.join(',')
      }

      await schedulePruningUseCase.execute(form.value)
      successMsg.value = 'Poda programada exitosamente.'
      addNotification('Poda programada', 'Poda programada exitosamente.', 'success')
      showBrowserNotification('Poda programada', 'Poda programada exitosamente.')
      form.value       = emptyForm()
      photoFiles.value = []
      await refreshPrunings()
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error desconocido'
      errorMsg.value = i18n.global.t('pruning.scheduleError', { message: resolveErrorMessage(raw) })
      addNotification(i18n.global.t('pruning.scheduleErrorTitle'), resolveErrorMessage(raw), 'error')
      showBrowserNotification(i18n.global.t('pruning.scheduleErrorTitle'), resolveErrorMessage(raw))
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
        selectedPruningPhotos.value = res.data?.urls ?? []
      } catch {
        photoLoadError.value = 'Error al cargar imagenes'
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

  // ── Poda preventiva ─────────────────────────────────────────────────────────

  const preventiveForm          = ref<PreventiveBatchForm>(emptyBatchForm())
  const selectedPreventiveTrees = ref<SelectedTreeEntry[]>([])
  const preventiveSubmitting    = ref(false)
  const preventiveSuccessMsg    = ref<string | null>(null)
  const preventiveErrorMsg      = ref<string | null>(null)

  /** Agrega un arbol a la lista. No agrega duplicados ni arboles sin coordenadas. */
  function addTreeToPreventive(treeId: string) {
    const tree = trees.value.find(t => t.id === treeId)
    if (!tree) return
    if (selectedPreventiveTrees.value.some(t => t.id === treeId)) return
    if (!tree.latitude || !tree.longitude) return
    selectedPreventiveTrees.value = [
      ...selectedPreventiveTrees.value,
      {
        id:    tree.id,
        label: tree.family?.commonName ?? tree.id,
        lat:   tree.latitude,
        lng:   tree.longitude,
      },
    ]
  }

  function removeTreeFromPreventive(treeId: string) {
    selectedPreventiveTrees.value = selectedPreventiveTrees.value.filter(t => t.id !== treeId)
  }

  function resetPreventiveForm() {
    preventiveForm.value          = emptyBatchForm()
    selectedPreventiveTrees.value = []
    preventiveSuccessMsg.value    = null
    preventiveErrorMsg.value      = null
    photoFiles.value              = []
  }

  async function submitPreventive() {
    preventiveSuccessMsg.value = null
    preventiveErrorMsg.value   = null
    preventiveSubmitting.value = true
    try {
      // Subir fotos primero (si hay)
      if (photoFiles.value.length > 0) {
        const paths: string[] = []
        for (const file of photoFiles.value) {
          const path = await uploadPhotoUseCase.execute(file)
          if (!path) throw new Error('La foto no retorno una ruta valida.')
          paths.push(path)
        }
        preventiveForm.value.photographicRecordPath = paths.join(',')
      }

      const count = await schedulePreventiveUseCase.execute({
        trees:                  selectedPreventiveTrees.value.map(t => t.id),
        plannedDate:            preventiveForm.value.plannedDate,
        quadrille:              preventiveForm.value.quadrille,
        photographicRecordPath: preventiveForm.value.photographicRecordPath || null,
        observations:           preventiveForm.value.observations           || null,
      })

      preventiveSuccessMsg.value = `${count} poda(s) preventiva(s) programada(s) exitosamente.`

      const successBody = `${count} poda(s) programada(s) para el ${preventiveForm.value.plannedDate}.`
      addNotification('Poda preventiva programada', successBody, 'success')
      showBrowserNotification('Poda preventiva programada', successBody)

      resetPreventiveForm()
      await refreshPrunings()
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error desconocido'
      preventiveErrorMsg.value = resolveErrorMessage(raw)
      addNotification(i18n.global.t('pruning.scheduleErrorTitle'), resolveErrorMessage(raw), 'error')
      showBrowserNotification(i18n.global.t('pruning.scheduleErrorTitle'), resolveErrorMessage(raw))
    } finally {
      preventiveSubmitting.value = false
    }
  }

  function selectTree(treeId: string) {
    const tree = trees.value.find(t => t.id === treeId)
    if (tree?.latitude && tree?.longitude) {
      selectedTreeCoords.value = { lat: tree.latitude, lng: tree.longitude }
    } else {
      selectedTreeCoords.value = null
    }
  }

  return {
    // datos de catalogo
    statuses, trees, quadrilles, pruningTypes, prunings, sectors,
    // formulario individual (legacy / futuro uso)
    form, photoFiles,
    loadingForm, loadingList, submitting, loadingTrees, successMsg, errorMsg,
    selectedTreeCoords, selectTree,
    // detalle de poda
    selectedPruning, selectedPruningPhotos, loadingPhotos, photoLoadError,
    loadFormData, loadTreesBySector, submit, addPhoto, removePhoto,
    openDetail, closeDetail,
    // poda preventiva
    preventiveForm, selectedPreventiveTrees, preventiveSubmitting,
    preventiveSuccessMsg, preventiveErrorMsg,
    addTreeToPreventive, removeTreeFromPreventive, resetPreventiveForm, submitPreventive,
  }
})
