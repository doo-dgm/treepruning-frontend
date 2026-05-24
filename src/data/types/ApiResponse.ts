// src/data/types/ApiResponse.ts
export interface ApiResponse<T> {
  data:    T
  message: string
  status:  number
}

export interface PagedResponse<T> {
  content:       T[]
  page:          number
  size:          number
  totalElements: number
  totalPages:    number
}
