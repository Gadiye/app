// hooks/useApi.ts
"use client"

import { useState, useEffect, useCallback } from "react"

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

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

  const cacheKey = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    let isMounted = true
    if (cache.has(cacheKey)) {
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION_TIME)) {
        setData(cachedEntry.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      if (isMounted) {
        setData(result)
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
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
  }, [apiCall, options.onSuccess, options.onError, cacheKey])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  const refetch = useCallback(async () => {
    cache.delete(cacheKey);
    return fetchData()
  }, [fetchData, cacheKey])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    cache.delete(cacheKey);
  }, [cacheKey])

  return { data, loading, error, refetch, reset }
}