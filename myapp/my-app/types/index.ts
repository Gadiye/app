export interface ArtisanLite {
  id: number;
  name: string;
}

export interface ProductLite {
  id: number;
  product_type: string;
  animal_type: string;
  base_price: number;
  service_category: string;
}

export interface JobDelivery {
  id: number;
  job_item: number; // Added missing property
  quantity_received: number;
  quantity_accepted: number;
  rejection_reason?: string | null;
  delivery_date: string;
  notes?: string | null;
}

export interface JobItem {
  id: number;
  job: number;
  artisan: ArtisanLite;
  product: ProductLite;
  quantity_ordered: number;
  quantity_received: number;
  quantity_accepted: number;
  rejection_reason?: string | null;
  original_amount: string;
  final_payment: string;
  payslip_generated: boolean;
  deliveries: JobDelivery[];
  service_rate_per_unit?: number; // Add this new field
}

export interface JobListEntry {
  job_id: number;
  created_date: string;
  created_by: string;
  status: "IN_PROGRESS" | "PARTIALLY_RECEIVED" | "COMPLETED";
  status_display: string;
  service_category: string;
  service_category_display: string;
  notes?: string | null;
  total_cost: string;
  total_final_payment: string;
  artisans_involved: string[];
}

export interface Job extends JobListEntry {
  items: JobItem[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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
  effective_date: string;
  changed_by: string;
  reason?: string;
}

export interface ProductPrice {
  price: number;
  service_rate_per_unit?: number; // Add this new field
}

export interface JobItemPayload {
  artisan: number;
  product_type: string;
  animal_type: string;
  size_category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateJobPayload {
  service_category: string;
  notes?: string;
  job_items: JobItemPayload[];
}

export interface ServiceRate {
  id: number;
  product: {
    id: number;
    product_type: string;
    animal_type: string;
    base_price: number;
  };
  service_category: string;
  rate_per_unit: number;
}