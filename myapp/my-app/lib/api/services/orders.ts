// lib/api/services/orders.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { Order } from '../types'

const ordersCrud = createCrudApi<Order>('orders')

export const ordersApi = {
  ...ordersCrud,
  
  updateStatus: (id: number, status: string) =>
    apiRequest<Order>(`/orders/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}