// lib/api/services/finishedStock.ts
import { createCrudApi } from '../base'
import { FinishedStock } from '../types'

// Only read operations for finished stock
const finishedStockCrud = createCrudApi<FinishedStock>('finished-stock')

export const finishedStockApi = {
  list: finishedStockCrud.list,
  get: finishedStockCrud.get,
}