// lib/api/services/reports.ts
import { apiRequest } from '../client'

export const reportsApi = {
  dashboard: () => 
    apiRequest<any>("/reports/dashboard/"),
  
  production: (params?: URLSearchParams) =>
    apiRequest<any>(`/reports/production/?${params?.toString() || ''}`, {
      method: "GET",
    }),
  
  financial: (params?: URLSearchParams) =>
    apiRequest<any>(`/reports/financial/?${params?.toString() || ''}`, {
      method: "GET",
    }),
}
// You can add more report-related methods as needed 