"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react"

// Mock job data with delivery history
const jobData = {
  id: 1024,
  createdDate: "2024-01-10",
  createdBy: "Admin",
  status: "PARTIALLY_RECEIVED",
  serviceCategory: "CARVING",
  notes: "High priority order for holiday season",
  artisan: {
    name: "John Smith",
    phone: "+1 (555) 123-4567",
  },
  items: [
    {
      id: 1,
      productType: "SITTING_ANIMAL",
      animalType: "Elephant",
      sizeCategory: "MEDIUM",
      quantityOrdered: 20,
      quantityReceived: 12,
      quantityAccepted: 11,
      unitPrice: 30.0,
      originalAmount: 600.0,
      finalPayment: 330.0,
      deliveries: [
        {
          id: 1,
          quantityReceived: 8,
          quantityAccepted: 7,
          rejectionReason: "QUALITY",
          deliveryDate: "2024-01-15T10:30:00Z",
          notes: "One piece had rough edges",
        },
        {
          id: 2,
          quantityReceived: 4,
          quantityAccepted: 4,
          rejectionReason: null,
          deliveryDate: "2024-01-18T14:15:00Z",
          notes: "Perfect quality",
        },
      ],
    },
  ],
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobData // In real app, fetch by params.id

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "PARTIALLY_RECEIVED":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRejectionReasonLabel = (reason: string | null) => {
    const reasons: Record<string, string> = {
      QUALITY: "Quality Issues",
      DAMAGE: "Damaged Item",
      OTHER: "Other",
    }
    return reason ? reasons[reason] : null
  }

  const getCompletionPercentage = (item: any) => {
    return (item.quantityReceived / item.quantityOrdered) * 100
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job #{job.id}</h1>
            <p className="text-muted-foreground mt-2">Created on {new Date(job.createdDate).toLocaleDateString()}</p>
          </div>
          <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Job Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Items</CardTitle>
                    <CardDescription>Products assigned to this job</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {job.items.map((item) => {
                        const completion = getCompletionPercentage(item)
                        const remaining = item.quantityOrdered - item.quantityReceived

                        return (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {item.productType.replace(/_/g, " ")}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  {item.animalType} • {item.sizeCategory.replace(/_/g, " ")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${item.unitPrice.toFixed(2)} each</p>
                                <p className="text-xs text-muted-foreground">Unit price</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  Progress: {item.quantityReceived}/{item.quantityOrdered}
                                </span>
                                <span>{completion.toFixed(0)}% complete</span>
                              </div>
                              <Progress value={completion} className="h-2" />

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Ordered</p>
                                  <p className="font-medium">{item.quantityOrdered}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Received</p>
                                  <p className="font-medium">{item.quantityReceived}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Accepted</p>
                                  <p className="font-medium text-green-600">{item.quantityAccepted}</p>
                                </div>
                              </div>

                              {remaining > 0 && (
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="text-xs text-muted-foreground">{remaining} pieces remaining</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deliveries">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery History</CardTitle>
                  <CardDescription>All deliveries received for this job</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.items.map((item) => (
                      <div key={item.id}>
                        <h4 className="font-medium mb-3">
                          {item.productType.replace(/_/g, " ")} - {item.animalType}
                        </h4>
                        <div className="space-y-3 ml-4">
                          {item.deliveries.map((delivery) => (
                            <div key={delivery.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                              <div className="flex-shrink-0">
                                {delivery.rejectionReason ? (
                                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium">
                                    Received: {delivery.quantityReceived}, Accepted: {delivery.quantityAccepted}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(delivery.deliveryDate).toLocaleDateString()} at{" "}
                                    {new Date(delivery.deliveryDate).toLocaleTimeString()}
                                  </p>
                                </div>
                                {delivery.rejectionReason && (
                                  <Badge variant="destructive" className="text-xs mb-2">
                                    {getRejectionReasonLabel(delivery.rejectionReason)}
                                  </Badge>
                                )}
                                {delivery.notes && <p className="text-xs text-muted-foreground">{delivery.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Breakdown</CardTitle>
                  <CardDescription>Original vs final payment amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Ordered Qty</TableHead>
                        <TableHead>Accepted Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Original Amount</TableHead>
                        <TableHead>Final Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {job.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productType.replace(/_/g, " ")}</p>
                              <p className="text-xs text-muted-foreground">{item.animalType}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantityOrdered}</TableCell>
                          <TableCell className="text-green-600 font-medium">{item.quantityAccepted}</TableCell>
                          <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>${item.originalAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${item.finalPayment.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Final Payment:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${job.items.reduce((sum, item) => sum + item.finalPayment, 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Difference from original: -$
                      {(
                        job.items.reduce((sum, item) => sum + item.originalAmount, 0) -
                        job.items.reduce((sum, item) => sum + item.finalPayment, 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Job Info Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{job.artisan.name}</p>
                  <p className="text-xs text-muted-foreground">{job.artisan.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">{new Date(job.createdDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Service Category</p>
                <Badge variant="secondary">{job.serviceCategory}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
              </div>

              {job.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-xs text-muted-foreground">{job.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{job.items.reduce((sum, item) => sum + item.quantityOrdered, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span>{job.items.reduce((sum, item) => sum + item.quantityReceived, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted:</span>
                    <span className="text-green-600 font-medium">
                      {job.items.reduce((sum, item) => sum + item.quantityAccepted, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
