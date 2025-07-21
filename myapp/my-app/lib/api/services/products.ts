// lib/api/services/products.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { Product, PriceHistory, ProductPrice } from '../types'

const productsCrud = createCrudApi<Product>('products')

export const productsApi = {
  ...productsCrud,
  
  getPriceHistory: (productId: number, params?: URLSearchParams) =>
    apiRequest<PriceHistory[]>(`/products/${productId}/price-history/?${params?.toString() || ''}`),
  
  getMetadata: () => 
    apiRequest<Record<string, unknown>>('/products/metadata/'),
  
  getPrice: (params: URLSearchParams) =>
    apiRequest<ProductPrice>(`/products/get_price/?${params.toString()}`),
}
