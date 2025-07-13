// lib/api/index.ts
export * from '@/lib/api/types'
export * from '@/lib/api/client'

import { productsApi } from '@/lib/api/services/products'
import { artisansApi } from '@/lib/api/services/artisans'
import { customersApi } from '@/lib/api/services/customers'
import { jobsApi } from '@/lib/api/services/jobs'
import { ordersApi } from '@/lib/api/services/orders'
import { payslipsApi } from '@/lib/api/services/payslips'
import { finishedStockApi } from '@/lib/api/services/finishedStock'
import { priceHistoryApi } from '@/lib/api/services/priceHistory'
import { reportsApi } from '@/lib/api/services/reports'

export const api = {
  products: productsApi,
  artisans: artisansApi,
  customers: customersApi,
  jobs: jobsApi,
  orders: ordersApi,
  payslips: payslipsApi,
  finishedStock: finishedStockApi,
  priceHistory: priceHistoryApi,
  reports: reportsApi,
}