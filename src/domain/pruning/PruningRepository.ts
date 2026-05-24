// src/domain/pruning/PruningRepository.ts
import type { Pruning, LookupItem, PruningForm, TreeLookupItem } from './PruningEntity'

export interface PruningFormData {
  statuses:     LookupItem[]
  trees:        TreeLookupItem[]
  quadrilles:   LookupItem[]
  pruningTypes: LookupItem[]
  prunings:     Pruning[]
  sectors:      LookupItem[]
}

export interface PruningRepository {
  getFormData():                      Promise<PruningFormData>
  getTreesBySector(sectorId: string): Promise<TreeLookupItem[]>  // ← solo uno
  getPrunings():                      Promise<Pruning[]>
  schedule(form: PruningForm):        Promise<void>
  uploadPhoto(file: File):            Promise<string>
}
