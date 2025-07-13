// lib/api/services/payslips.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { Payslip } from '../types'

const payslipsCrud = createCrudApi<Payslip>('payslips')

export const payslipsApi = {
  ...payslipsCrud,
  
  generate: (data: {
    artisan_id?: number
    service_category?: string
    period_start: string
    period_end: string
  }) =>
    apiRequest<Payslip | Payslip[]>("/payslips/generate/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  download: (id: number) =>
    apiRequest<Blob>(`/payslips/${id}/download/`, {
      headers: {},
    }),
}