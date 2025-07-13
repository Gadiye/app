// hooks/useProductPrice.ts
"use client"

import { useApi } from './useApi'
import { api } from '../lib/api'
import { Product } from '../lib/api/types'

export function useProductPrice(
  productType?: string,
  animalType?: string,
  serviceCategory?: string,
  sizeCategory?: string,
  options?: { immediate?: boolean; enabled?: boolean }
) {
  const params = new URLSearchParams()
  if (productType) params.append("product_type", productType)
  if (animalType) params.append("animal_type", animalType)
  if (serviceCategory) params.append("service_category", serviceCategory)
  if (sizeCategory) params.append("size_category", sizeCategory)

  const enabled =
    !!(options?.enabled !== false &&
      productType &&
      animalType &&
      serviceCategory)

  return useApi<Product>(
    () =>
      enabled
        ? api.products.getPrice(params)
        : Promise.resolve({} as Product), // Return an empty Product object if not enabled
    [productType, animalType, serviceCategory, sizeCategory, enabled],
    {
      ...options,
      immediate: options?.immediate !== false && enabled,
    }
  )
}
