import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, CheckCircle } from "lucide-react"

// Mock data
const jobs = [
  {
    id: 1024,
    createdDate: "2024-01-15",
    serviceCategory: "CARVING",
    status: "IN_PROGRESS",
    artisan: "John Smith",
    totalCost: 480.0,
    itemCount: 12,
    productType: "Elephant Figurines",
  },
  {
    id: 1025,
    createdDate: "2024-01-14",
    serviceCategory: "PAINTING",
    status: "IN_PROGRESS",
    artisan: "Maria Garcia",
    totalCost: 320.0,
    itemCount: 8,
    productType: "Lion Masks",
  },
  {
    id: 1026,
    createdDate: "2024-01-13",
    serviceCategory: "FINISHING",
    status: "COMPLETED",
    artisan: "Carlos Rodriguez",
    totalCost: 675.0,
    itemCount: 15,
    productType: "Yoga Bowls",
  },
  {
    id: 1023,
    createdDate: "2024-01-12",
    serviceCategory: "SANDING",
    status: "COMPLETED",
    artisan: "Anna Johnson",
    totalCost: 240.0,
    itemCount: 6,
    productType: "Bird Sculptures",
  },
]

export default function JobsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage artisan work assignments</p>
          </div>
          <div className="flex gap-2">
            <Link href="/jobs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            </Link>
            <Link href="/jobs/complete">
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter((job) => job.status === "IN_PROGRESS").length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {jobs
                .filter((job) => job.status === "IN_PROGRESS")
                .reduce((sum, job) => sum + job.totalCost, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Active jobs value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter((job) => job.status === "COMPLETED").length}</div>
            <p className="text-xs text-muted-foreground">Jobs finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>Complete list of production jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">#{job.id}</TableCell>
                  <TableCell>{job.createdDate}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.serviceCategory}</Badge>
                  </TableCell>
                  <TableCell>{job.artisan}</TableCell>
                  <TableCell>{job.productType}</TableCell>
                  <TableCell>{job.itemCount}</TableCell>
                  <TableCell className="font-medium">${job.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "COMPLETED" ? "default" : "secondary"}>
                      {job.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
