import type { PruningRepository } from './PruningRepository'

export interface PreventivePayload {
  trees:                  string[]
  plannedDate:            string
  quadrille:              string
  photographicRecordPath: string | null
  observations:           string | null
}

export class SchedulePreventivePruningUseCase {
  constructor(private readonly repo: PruningRepository) {}

  /** Retorna la cantidad de podas creadas por el backend. */
  async execute(payload: PreventivePayload): Promise<number> {
    return this.repo.schedulePreventive(payload)
  }
}
