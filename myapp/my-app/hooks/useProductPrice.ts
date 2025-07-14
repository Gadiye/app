// hooks/useProductPrice.ts
"use client"

import { useApi } from './useApi'
import { api } from '../lib/api'
import { Product } from '../lib/api/types'

export function useProductPrice(
  productType?: string,
  animalType?: string,
  sizeCategory?: string,
  serviceCategory?: string, // Add serviceCategory parameter
  options?: { immediate?: boolean; enabled?: boolean }
) {
  const params = new URLSearchParams()
  if (productType) params.append("product_type", productType)
  if (animalType) params.append("animal_type", animalType)
  if (sizeCategory) params.append("size_category", sizeCategory)
  if (serviceCategory) params.append("service_category", serviceCategory) // Append serviceCategory

  const enabled =
    !!(options?.enabled !== false &&
      productType &&
      animalType &&
      serviceCategory) // serviceCategory is now required for fetching price

  return useApi<Product>(
    () =>
      enabled
        ? api.products.getPrice(params)
        : Promise.resolve({} as Product), // Return an empty Product object if not enabled
    [productType, animalType, sizeCategory, serviceCategory, enabled], // Add serviceCategory to dependencies
    {
      ...options,
      immediate: options?.immediate !== false && enabled,
    }
  )
}
