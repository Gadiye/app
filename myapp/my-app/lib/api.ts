

// API configuration and base functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/"

// Types based on your Django models
export interface Product {
  id: number
  product_type: string
  animal_type: string
  service_category: string
  size_category: string
  base_price: number
  is_active: boolean
  last_price_update: string
}

export interface Artisan {
  id: number
  name: string
  phone?: string
  is_active: boolean
  created_date: string
  total_earnings?: number
  pending_payment?: number
  average_rating?: number
  total_jobs?: number
  specialties?: string[]
  last_job_date?: string | null
}

export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  created_date: string
  is_active: boolean
}

export interface Job {
  job_id: number
  created_date: string
  created_by: string
  status: "IN_PROGRESS" | "PARTIALLY_RECEIVED" | "COMPLETED"
  service_category: string
  notes?: string
  total_cost: number
  total_final_payment: number
  items: JobItem[]
}

export interface JobItem {
  id: number
  job: number
  artisan: number
  product: number
  quantity_ordered: number
  quantity_received: number
  quantity_accepted: number
  rejection_reason?: string
  original_amount: number
  final_payment: number
  payslip_generated: boolean
}

export interface Order {
  order_id: number
  customer: number
  created_date: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total_amount: number
  notes?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  order: number
  product: number
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Payslip {
  id: number
  artisan: number
  service_category?: string
  generated_date: string
  pdf_file: string
  total_payment: number
  period_start: string
  period_end: string
}

export interface FinishedStock {
  id: number
  product: number
  quantity: number
  average_cost: number
  last_updated: string
}

// NEW: PriceHistory Interface
export interface PriceHistory {
  id: number
  product: {
    id: number;
    product_type: string;
    animal_type: string;
    service_category: string;
  };
  old_price: number;
  new_price: number;
  effective_date: string; // ISO 8601 string
  changed_by: string;
  reason?: string;
}

// Generic API functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add CSRF token if available (for Django)
  const csrfToken = getCsrfToken()
  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(config.method?.toUpperCase() || "")) {
    config.headers = {
      ...config.headers,
      "X-CSRFToken": csrfToken,
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      // Attempt to parse JSON error message from backend
      const errorBody = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
      throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content for DELETE requests
    if (response.status === 204) {
      return null as T; // Return null for void type
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

function getCsrfToken(): string | null {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "csrftoken") {
        return value
      }
    }
  }
  return null
}

// API functions for each model
export const api = {
  // Products
  products: {
    list: (params?: URLSearchParams) => apiRequest<Product[]>(`/products/?${params?.toString() || ''}`),
    get: (id: number) => apiRequest<Product>(`/products/${id}/`),
    create: (data: Partial<Product>) =>
      apiRequest<Product>("/products/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Product>) =>
      apiRequest<Product>(`/products/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiRequest<void>(`/products/${id}/`, {
        method: "DELETE",
      }),
    // Nested price history for a product
    getPriceHistory: (productId: number, params?: URLSearchParams) =>
      apiRequest<PriceHistory[]>(`/products/${productId}/price-history/?${params?.toString() || ''}`),
    getMetadata: () => apiRequest<any>('/products/metadata/'),

    getPrice: (params: URLSearchParams) =>
      apiRequest<{ price: number }>(`/products/get_price/?${params.toString()}`),
  },

    

  // Artisans
  artisans: {
    list: () => apiRequest<{ results: Artisan[] }>("/artisans/").then(res => res.results),
    get: (id: number) => apiRequest<Artisan>(`/artisans/${id}/`),
    create: (data: Partial<Artisan>) =>
      apiRequest<Artisan>("/artisans/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Artisan>) =>
      apiRequest<Artisan>(`/artisans/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiRequest<void>(`/artisans/${id}/`, {
        method: "DELETE",
      }),
  },

  // Customers
  customers: {
    list: () => apiRequest<Customer[]>("/customers/"),
    get: (id: number) => apiRequest<Customer>(`/customers/${id}/`),
    create: (data: Partial<Customer>) =>
      apiRequest<Customer>("/customers/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Customer>) =>
      apiRequest<Customer>(`/customers/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiRequest<void>(`/customers/${id}/`, {
        method: "DELETE",
      }),
  },

  // Jobs
  jobs: {
    list: () => apiRequest<Job[]>("/jobs/"),
    get: (id: number) => apiRequest<Job>(`/jobs/${id}/`),
    create: (data: Partial<Job>) =>
      apiRequest<Job>("/jobs/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Job>) =>
      apiRequest<Job>(`/jobs/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    complete: (id: number, completionData: any) =>
      apiRequest<Job>(`/jobs/${id}/complete/`, {
        method: "POST",
        body: JSON.stringify(completionData),
      }),
  },

  // Orders
  orders: {
    list: () => apiRequest<Order[]>("/orders/"),
    get: (id: number) => apiRequest<Order>(`/orders/${id}/`),
    create: (data: Partial<Order>) =>
      apiRequest<Order>("/orders/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Order>) =>
      apiRequest<Order>(`/orders/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string) =>
      apiRequest<Order>(`/orders/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Payslips
  payslips: {
    list: () => apiRequest<Payslip[]>("/payslips/"),
    get: (id: number) => apiRequest<Payslip>(`/payslips/${id}/`),
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
  },

  // Finished Stock
  finishedStock: {
    list: () => apiRequest<FinishedStock[]>("/finished-stock/"),
    get: (id: number) => apiRequest<FinishedStock>(`/finished-stock/${id}/`),
  },

  // NEW: PriceHistory
  priceHistory: {
    list: (params?: URLSearchParams) => apiRequest<PriceHistory[]>(`/price-history/?${params?.toString() || ''}`),
    get: (id: number) => apiRequest<PriceHistory>(`/price-history/${id}/`),
    create: (data: Partial<PriceHistory>) =>
      apiRequest<PriceHistory>("/price-history/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<PriceHistory>) =>
      apiRequest<PriceHistory>(`/price-history/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    partialUpdate: (id: number, data: Partial<PriceHistory>) =>
      apiRequest<PriceHistory>(`/price-history/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiRequest<void>(`/price-history/${id}/`, {
        method: "DELETE",
      }),
    getMetadata: () => apiRequest<any>('/price-history/metadata/'),
  },

  // Reports
  reports: {
    dashboard: () => apiRequest<any>("/reports/dashboard/"),
    production: (params?: URLSearchParams) =>
      apiRequest<any>(`/reports/production/?${params?.toString() || ''}`, {
        method: "GET",
      }),
    financial: (params?: URLSearchParams) =>
      apiRequest<any>(`/reports/financial/?${params?.toString() || ''}`, {
        method: "GET",
      }),
  },
}