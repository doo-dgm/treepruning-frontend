// src/domain/gestion/GestionRepository.ts
import type { EntityType, GestionRow } from './GestionEntity'

export interface GestionRepository {
  getByEntity(entity: EntityType): Promise<GestionRow[]>
}
