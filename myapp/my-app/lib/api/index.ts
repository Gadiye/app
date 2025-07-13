import { JobListEntry } from "@/types";

export interface Job {
  job_id: number;
  created_date: string;
  service_category: string;
  service_category_display: string; // Added
  created_by: string;
  notes?: string; // Added
  total_cost: string | number;
  total_final_payment: string | number; // Added
  status: "IN_PROGRESS" | "COMPLETED" | "PENDING";
  status_display: string; // Added
  items: JobListEntry[]; // Added
}

export interface PaginatedJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}