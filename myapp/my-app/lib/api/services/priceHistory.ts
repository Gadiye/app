// lib/api/services/priceHistory.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { PriceHistory } from '../types'

const priceHistoryCrud = createCrudApi<PriceHistory>('price-history')

export const priceHistoryApi = {
  ...priceHistoryCrud,
  
  getMetadata: () => 
    apiRequest<Record<string, unknown>>('/price-history/metadata/'),
}