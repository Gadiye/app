// lib/api/services/jobs.ts
import { apiRequest } from '../client'
import { createCrudApi } from '../base'
import { Job, CreateJobPayload, PaginatedJobsResponse } from '../types'

const jobsCrud = createCrudApi<Job, PaginatedJobsResponse>('jobs')

export const jobsApi = {
  ...jobsCrud,
  
  complete: (id: number, completionData: any) =>
    apiRequest<Job>(`/jobs/${id}/complete/`, {
      method: "POST",
      body: JSON.stringify(completionData),
    }),

  createItem: (jobId: number, itemData: any) =>
    apiRequest<JobItem>(`/jobs/${jobId}/items/`, {
      method: "POST",
      body: JSON.stringify(itemData),
    }),
}