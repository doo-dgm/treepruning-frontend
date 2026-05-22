import type { GestionRepository }  from '@/domain/gestion/GestionRepository'
import type { EntityType, GestionRow } from '@/domain/gestion/GestionEntity'
import {
  treeService,
  quadrilleService,
  statusService,
  pruningTypeService,
} from '@/data/services'

export class GestionRepositoryImpl implements GestionRepository {
  async getByEntity(entity: EntityType): Promise<GestionRow[]> {
    switch (entity) {
      case 'arbol':     return (await treeService.getAll()).data        ?? []
      case 'cuadrilla': return (await quadrilleService.getAll()).data   ?? []
      case 'estado':    return (await statusService.getAll()).data      ?? []
      case 'tipo':      return (await pruningTypeService.getAll()).data ?? []
      default:          return []
    }
  }
}
