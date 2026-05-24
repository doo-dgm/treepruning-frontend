import type { PruningRepository } from './PruningRepository'
import type { LookupItem }        from './PruningEntity'

export class GetTreesBySectorUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(sectorId: string): Promise<LookupItem[]> {
    return this.repo.getTreesBySector(sectorId)
  }
}
