// hooks/usePriceHistory.ts
"use client"

import { useApi } from './useApi'
import { api } from '../lib/api'
import { PriceHistory } from '../lib/api/types'

export function usePriceHistory(productId?: number, params?: URLSearchParams) {
  return useApi<PriceHistory[]>(
    () =>
      productId
        ? api.products.getPriceHistory(productId, params)
        : api.priceHistory.list(params),
    [productId, params?.toString()]
  )
}