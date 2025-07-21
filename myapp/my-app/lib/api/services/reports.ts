// lib/api/services/reports.ts
import { apiRequest } from '../client'

export const reportsApi = {
  dashboard: () => 
    apiRequest<Record<string, unknown>>("/reports/dashboard/"),
  
  production: (params?: URLSearchParams) =>
    apiRequest<Record<string, unknown>>(`/reports/production/?${params?.toString() || ''}`, {
      method: "GET",
    }),
  
  financial: (params?: URLSearchParams) =>
    apiRequest<Record<string, unknown>>(`/reports/financial/?${params?.toString() || ''}`, {
      method: "GET",
    }),
}
// You can add more report-related methods as needed 