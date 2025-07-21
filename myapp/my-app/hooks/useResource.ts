// hooks/useResource.ts
"use client"

import { useApi } from './useApi'
import { api } from '../lib/api'


import { PaginatedResponse, Job, JobListEntry } from '@/types';

function createResourceHook<T>(apiCall: () => Promise<PaginatedResponse<T>>) {
  return (options?: { immediate?: boolean }) => {
    const { data, ...rest } = useApi(apiCall, [], options);
    const normalizedData = (data && typeof data === 'object' && 'results' in data) ? (data as any).results : data;
    return { data: normalizedData as T[], ...rest };
  }
}

// List hooks
export const useArtisans = createResourceHook<Artisan>(() => api.artisans.list())
export const useProducts = createResourceHook(() => api.products.list())
export const useCustomers = createResourceHook(() => api.customers.list())
export const useJobs = createResourceHook<Job[]>(() => api.jobs.list())
export const useOrders = createResourceHook(() => api.orders.list())
export const useFinishedStock = createResourceHook(() => api.finishedStock.list())
export const usePayslips = createResourceHook(() => api.payslips.list())
export const useServiceRates = createResourceHook(() => api.serviceRates.list())
export const useInventory = createResourceHook(() => api.inventory.list())

// Individual resource hooks
export function useArtisan(id: number, options?: { immediate?: boolean }) {
  return useApi(() => api.artisans.get(id), [id], options)
}

export function useCustomer(id: number, options?: { immediate?: boolean }) {
  return useApi(() => api.customers.get(id), [id], options)
}

export function useJob(id: number, options?: { immediate?: boolean }) {
  return useApi(() => api.jobs.get(id), [id], options)
}

export function useProduct(id: number, options?: { immediate?: boolean }) {
  return useApi(() => api.products.get(id), [id], options)
}

export function useOrder(id: number, options?: { immediate?: boolean }) {
  return useApi(() => api.orders.get(id), [id], options)
}