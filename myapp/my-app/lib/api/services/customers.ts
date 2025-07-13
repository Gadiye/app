import { createCrudApi } from '../base'
import { Customer } from '../types'

export const customersApi = createCrudApi<Customer>('customers')
export const customersService = {
  ...customersApi,

  // Add any custom methods specific to customers here
  // For example, if you need to fetch customers by a specific criteria
  search: (query: string) => 
    customersApi.list(new URLSearchParams({ search: query })),
}