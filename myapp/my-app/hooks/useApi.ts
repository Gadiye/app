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

// --- Specific Hooks (with dynamic import) ---
export function useArtisans() {
  return useApi<Artisan[]>(() =>
    import("../lib/api").then(({ api }) => api.artisans.list())
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

export function useProducts() {
  return useApi<Product[]>(() =>
    import("../lib/api").then(({ api }) => api.products.list())
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

// --- Individual Resource Hooks ---
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

export function useOrder(id: number, options?: { immediate?: boolean }) {
  return useApi<Order>(
    () => import("../lib/api").then(({ api }) => api.orders.get(id)),
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

// --- Price History Hook (Smart Filtering) ---
export function usePriceHistory(
  productId?: number,
  params?: URLSearchParams
) {
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

// --- Mutation Hooks ---
export function useCreateArtisan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: Partial<Artisan>) => {
    try {
      setLoading(true)
      setError(null)
      const { api } = await import("../lib/api")
      const result = await api.artisans.create(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useUpdateArtisan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (id: number, data: Partial<Artisan>) => {
    try {
      setLoading(true)
      setError(null)
      const { api } = await import("../lib/api")
      const result = await api.artisans.update(id, data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

export function useDeleteArtisan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const delete_ = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const { api } = await import("../lib/api")
      await api.artisans.delete(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { delete: delete_, loading, error }
}

export function useCreateJob() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobResponse, setJobResponse] = useState<any>(null)

  const createJob = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      setJobResponse(null)
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