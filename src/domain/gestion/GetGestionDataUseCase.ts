import type { GestionRepository }       from './GestionRepository'
import type { EntityType, GestionResult, GestionRow } from './GestionEntity'

export class GetGestionDataUseCase {
  constructor(private readonly repo: GestionRepository) {}

  async execute(entity: EntityType): Promise<GestionResult> {

    const raw  = await this.repo.getByEntity(entity)
    const rows = raw.map(flattenRow)
    return { columns: Object.keys(rows[0] ?? {}), rows }
  }
}

function flattenRow(row: GestionRow): GestionRow {
  const flat: GestionRow = {}
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value as object)) {
        flat[`${key}.${subKey}`] = subValue
      }
    } else {
      flat[key] = value
    }
  }
  return flat
}
