"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  Artisan,
  Customer,
  Job,
  Order,
  Product,
  FinishedStock,
  Payslip,
  PriceHistory,
  CreateJobPayload,
  JobItemPayload,
  ProductPrice,
} from "../lib/api"

// --- Generic API Hook ---
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.immediate !== false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    let isMounted = true
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      if (isMounted) {
        setData(result)
        options.onSuccess?.(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      if (isMounted) {
        setError(errorMessage)
        options.onError?.(errorMessage)
      }
    } finally {
      if (isMounted) setLoading(false)
    }
    return () => {
      isMounted = false
    }
  }, [apiCall, options.onSuccess, options.onError])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, dependencies)

  const refetch = useCallback(async () => {
    return fetchData()
  }, [fetchData])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, refetch, reset }
}

// --- List Fetching Hooks ---
export function useArtisans() {
  return useApi<Artisan[]>(() =>
    import("../lib/api").then(({ api }) => api.artisans.list())
  )
}

export function useProducts() {
  return useApi<Product[]>(() =>
    import("../lib/api").then(({ api }) => api.products.list())
  )
}

export function useCustomers() {
  return useApi<Customer[]>(() =>
    import("../lib/api").then(({ api }) => api.customers.list())
  )
}

export function useJobs() {
  return useApi<Job[]>(() =>
    import("../lib/api").then(({ api }) => api.jobs.list())
  )
}

export function useOrders() {
  return useApi<Order[]>(() =>
    import("../lib/api").then(({ api }) => api.orders.list())
  )
}

export function useFinishedStock() {
  return useApi<FinishedStock[]>(() =>
    import("../lib/api").then(({ api }) => api.finishedStock.list())
  )
}

export function usePayslips() {
  return useApi<Payslip[]>(() =>
    import("../lib/api").then(({ api }) => api.payslips.list())
  )
}

// --- Individual Resource Fetching Hooks ---
export function useArtisan(id: number, options?: { immediate?: boolean }) {
  return useApi<Artisan>(
    () => import("../lib/api").then(({ api }) => api.artisans.get(id)),
    [id],
    options
  )
}

export function useCustomer(id: number, options?: { immediate?: boolean }) {
  return useApi<Customer>(
    () => import("../lib/api").then(({ api }) => api.customers.get(id)),
    [id],
    options
  )
}

export function useJob(id: number, options?: { immediate?: boolean }) {
  return useApi<Job>(
    () => import("../lib/api").then(({ api }) => api.jobs.get(id)),
    [id],
    options
  )
}

export function useProduct(id: number, options?: { immediate?: boolean }) {
  return useApi<Product>(
    () => import("../lib/api").then(({ api }) => api.products.get(id)),
    [id],
    options
  )
}

// --- Smart Lookup Hook ---
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
    options?.enabled !== false &&
    productType &&
    animalType &&
    serviceCategory

  return useApi<ProductPrice>(
    () =>
      enabled
        ? import("../lib/api").then(({ api }) =>
            api.products.getPrice(params)
          )
        : Promise.resolve({ price: 0 }),
    [productType, animalType, serviceCategory, sizeCategory, enabled],
    {
      ...options,
      immediate: options?.immediate !== false && enabled,
    }
  )
}

// --- Price History ---
export function usePriceHistory(productId?: number, params?: URLSearchParams) {
  return useApi<PriceHistory[]>(
    () =>
      import("../lib/api").then(({ api }) =>
        productId
          ? api.products.getPriceHistory(productId, params)
          : api.priceHistory.list(params)
      ),
    [productId, params?.toString()]
  )
}

// --- Mutations ---
export function useCreateJob() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobResponse, setJobResponse] = useState<Job | null>(null)

  const createJob = useCallback(async (data: CreateJobPayload) => {
    try {
      setLoading(true)
      setError(null)
      const { api } = await import("../lib/api")
      const result = await api.jobs.create(data)
      setJobResponse(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createJob, loading, error, jobResponse }
}

// --- Exports ---
export {
  useApi,
  useArtisans,
  useProducts,
  useCustomers,
  useJobs,
  useOrders,
  useFinishedStock,
  usePayslips,
  useArtisan,
  useCustomer,
  useJob,
  useProduct,
  useProductPrice,  // ✅ Make sure this is exported
  usePriceHistory,
  useCreateJob,
}
