import type { PruningRepository } from './PruningRepository'
import type { Pruning }           from './PruningEntity'

export class GetPruningsUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(): Promise<Pruning[]> {
    return this.repo.getPrunings()
  }
}
