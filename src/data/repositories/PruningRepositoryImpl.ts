// src/data/repositories/PruningRepositoryImpl.ts
import type { PruningRepository, PruningFormData } from '@/domain/pruning/PruningRepository'
import type { Pruning, LookupItem, PruningForm }   from '@/domain/pruning/PruningEntity'
import { photoService } from '@/data/services/photo.service'
import {
  statusService,
  treeService,
  quadrilleService,
  pruningTypeService,
  pruningService,
  sectorService
} from '@/data/services'

export class PruningRepositoryImpl implements PruningRepository {
  async getTreesBySector(sectorId: string): Promise<LookupItem[]> {
    const res = await treeService.getBySector(sectorId)
    return (res.data ?? []) as LookupItem[]
  }

  schedule(form: PruningForm): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async getFormData(): Promise<PruningFormData> {
    const [s, t, q, pt, p, se] = await Promise.all([
      statusService.getAll(),
      treeService.getAll(),
      quadrilleService.getAll(),
      pruningTypeService.getAll(),
      pruningService.getAll(),
      sectorService.getAll(),
    ])

    return {
      statuses:     (s.data  ?? []) as LookupItem[],
      trees:        [],
      quadrilles:   (q.data  ?? []) as LookupItem[],
      pruningTypes: (pt.data ?? []) as LookupItem[],
      prunings: (p.data?.content ?? []) as Pruning[],
      sectors:      (se.data  ?? []) as LookupItem[],
      }
  }

  async uploadPhoto(file: File): Promise<string> {
  const res = await photoService.upload(file)
  return res.data.path
}

  async getPrunings(): Promise<Pruning[]> {
  const res = await pruningService.getAll()
  return (res.data?.content ?? []) as Pruning[]
}
}
