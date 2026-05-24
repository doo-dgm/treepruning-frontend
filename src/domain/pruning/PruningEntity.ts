import { QuadrilleRef, SectorRef, StatusRef, TreeRef, TypeRef } from "../share/types"

export interface PruningForm {
  status:                 string
  plannedDate:            string
  executedDate:           string
  tree:                   string
  sector:                string
  quadrille:              string
  type:                   string
  photographicRecordPath: string
  observations:           string
}

export interface Pruning {
  id:                     string
  plannedDate:            string | null
  executedDate:           string | null
  photographicRecordPath: string | null
  observations:           string | null
  status:                 StatusRef
  type:                   TypeRef
  tree:                   TreeRef
  quadrille:              QuadrilleRef
  sector:                SectorRef
}

export interface TreeLookupItem {
  id:        string
  latitude:  number
  longitude: number
  family?:   { commonName: string; scientificName: string }
  sector?:   { id: string; name: string }
  [key: string]: unknown
}

export interface LookupItem {
  id:    string
  name?: string
  [key: string]: unknown
}

export const emptyForm = (): PruningForm => ({
  status:                 '',
  plannedDate:            '',
  executedDate:           '',
  tree:                   '',
  sector:                '',
  quadrille:              '',
  type:                   '',
  photographicRecordPath: '',
  observations:           '',
})
