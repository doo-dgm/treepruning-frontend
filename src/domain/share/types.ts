// src/domain/shared/types.ts

export interface StatusRef {
  id:   string
  name: string
}

export interface TypeRef {
  id:   string
  name: string
}

export interface SectorRef {
  id:   string
  name: string
}

export interface FamilyRef {
  id:             string
  commonName:     string
  scientificName: string
}

export interface TreeRef {
  id:        string
  latitude:  number
  longitude: number
  family:    FamilyRef
  sector:    SectorRef
}

export interface PersonRef {
  id:             string
  firstName:      string
  firstLastName:  string
  secondLastName: string
  documentNumber: string
  email:          string
  phone:          string
  address:        string
  birthDate:      string
  age:            number
}

export interface ManagerRef {
  id:     string
  person: PersonRef
}

export interface QuadrilleRef {
  id:            string
  quadrilleName: string
  manager?:      ManagerRef
}
