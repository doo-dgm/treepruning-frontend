import type { PruningRepository } from './PruningRepository'
import type { LookupItem, TreeLookupItem  }        from './PruningEntity'

export class GetTreesBySectorUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(sectorId: string): Promise<TreeLookupItem[]> {
    return this.repo.getTreesBySector(sectorId)
  }

}
