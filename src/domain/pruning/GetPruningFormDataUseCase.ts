import type { PruningRepository } from './PruningRepository'
import type { PruningFormData }   from './PruningRepository'

export class GetPruningFormDataUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(): Promise<PruningFormData> {
    return this.repo.getFormData()
  }
}
