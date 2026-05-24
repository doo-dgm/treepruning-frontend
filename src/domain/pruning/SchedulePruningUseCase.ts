import type { PruningRepository } from './PruningRepository'
import type { PruningForm }       from './PruningEntity'

export class SchedulePruningUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(form: PruningForm): Promise<void> {
    const payload: PruningForm = {
      status:                 form.status                 || '',
      plannedDate:            form.plannedDate            || '',
      executedDate:           form.executedDate           || '',
      tree:                   form.tree                   || '',
      quadrille:              form.quadrille              || '',
      type:                   form.type                   || '',
      photographicRecordPath: form.photographicRecordPath || '',
      observations:           form.observations           || '',
    }
    return this.repo.schedule(payload)
  }
}
