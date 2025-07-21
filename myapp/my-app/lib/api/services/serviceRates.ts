// lib/api/services/serviceRates.ts
import { createCrudApi } from '../base'
import { ServiceRate } from '../types'

export const serviceRatesApi = createCrudApi<ServiceRate>('service-rates')
