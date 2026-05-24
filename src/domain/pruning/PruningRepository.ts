import type { Pruning, LookupItem, PruningForm } from './PruningEntity'

export interface PruningFormData {
  statuses:     LookupItem[]
  trees:        LookupItem[]
  quadrilles:   LookupItem[]
  pruningTypes: LookupItem[]
  prunings:     Pruning[]
  sectors:      LookupItem[]
}

export interface PruningRepository {
  getFormData():           Promise<PruningFormData>
  getTreesBySector(sectorId: string): Promise<LookupItem[]>
  getPrunings():           Promise<Pruning[]>
  schedule(form: PruningForm): Promise<void>
  uploadPhoto(file: File): Promise<string>
}
