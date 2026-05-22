// src/domain/gestion/GestionEntity.ts

export type EntityType =
  | 'personas'
  | 'sector'
  | 'familia'
  | 'arbol'
  | 'herramienta'
  | 'cuadrilla'
  | 'estado'
  | 'tipo'

export interface GestionRow {
  [key: string]: unknown
}

export interface GestionResult {
  columns: string[]
  rows:    GestionRow[]
}
