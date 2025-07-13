// lib/api/services/artisans.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { Artisan } from '../types'

const artisansCrud = createCrudApi<Artisan>('artisans')

export const artisansApi = {
  ...artisansCrud,
  
  // Override list to handle pagination
  list: () => 
    apiRequest<{ results: Artisan[] }>("/artisans/").then(res => res.results),
}