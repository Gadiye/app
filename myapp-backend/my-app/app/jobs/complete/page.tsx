"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Package, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock active jobs with delivery tracking
const activeJobs = [
  {
    id: 1024,
    serviceCategory: "CARVING",
    artisan: "John Smith",
    status: "IN_PROGRESS",
    items: [
      {
        id: 1,
        productType: "SITTING_ANIMAL",
        animalType: "Elephant",
        sizeCategory: "MEDIUM",
        quantityOrdered: 20,
        quantityReceived: 0,
        quantityAccepted: 0,
        unitPrice: 30.0,
        deliveries: [],
      },
    ],
  },
  {
    id: 1025,
    serviceCategory: "PAINTING",
    artisan: "Maria Garcia",
    status: "PARTIALLY_RECEIVED",
    items: [
      {
        id: 2,
        productType: "ANIMAL_MASKS",
        animalType: "Lion",
        sizeCategory: "LARGE",
        quantityOrdered: 15,
        quantityReceived: 8,
        quantityAccepted: 7,
        unitPrice: 40.0,
        deliveries: [
          {
            id: 1,
            quantityReceived: 8,
            quantityAccepted: 7,
            rejectionReason: "QUALITY",
            deliveryDate: "2024-01-15",
            notes: "One piece had paint smudging",
          },
        ],
      },
    ],
  },
]

const rejectionReasons = [
  { value: "QUALITY", label: "Quality Issues" },
  { value: "DAMAGE", label: "Damaged Item" },
  { value: "OTHER", label: "Other" },
]

interface Delivery {
  quantityReceived: number
  quantityAccepted: number
  rejectionReason?: string
  notes?: string
}

export default function CompleteJobPage() {
  const router = useRouter()
  const [selectedJobId, setSelectedJobId] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [newDelivery, setNewDelivery] = useState<Delivery>({
    quantityReceived: 0,
    quantityAccepted: 0,
    rejectionReason: "",
    notes: "",
  })

  const selectedJob = activeJobs.find((job) => job.id.toString() === selectedJobId)
  const selectedItem = selectedJob?.items.find((item) => item.id === selectedItemId)

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId)
    setSelectedItemId(null)
    resetDeliveryForm()
  }

  const resetDeliveryForm = () => {
    setNewDelivery({
      quantityReceived: 0,
      quantityAccepted: 0,
      rejectionReason: "",
      notes: "",
    })
  }

  const handleAddDelivery = () => {
    if (selectedItem && newDelivery.quantityReceived > 0) {
      const remainingQuantity = selectedItem.quantityOrdered - selectedItem.quantityReceived

      if (newDelivery.quantityReceived > remainingQuantity) {
        alert(`Cannot receive ${newDelivery.quantityReceived} pieces. Only ${remainingQuantity} pieces remain.`)
        return
      }

      // In real app, this would create a JobDelivery record
      console.log("Creating delivery:", {
        jobItemId: selectedItem.id,
        ...newDelivery,
      })

      // Update mock data (in real app, this would be handled by the backend)
      selectedItem.deliveries.push({
        id: Date.now(),
        deliveryDate: new Date().toISOString().split("T")[0],
        ...newDelivery,
      })

      selectedItem.quantityReceived += newDelivery.quantityReceived
      selectedItem.quantityAccepted += newDelivery.quantityAccepted

      resetDeliveryForm()
    }
  }

  const getRemainingQuantity = (item: any) => {
    return item.quantityOrdered - item.quantityReceived
  }

  const getCompletionPercentage = (item: any) => {
    return (item.quantityReceived / item.quantityOrdered) * 100
  }

  const getJobStatus = (job: any) => {
    const totalOrdered = job.items.reduce((sum: number, item: any) => sum + item.quantityOrdered, 0)
    const totalReceived = job.items.reduce((sum: number, item: any) => sum + item.quantityReceived, 0)

    if (totalReceived === 0) return "IN_PROGRESS"
    if (totalReceived < totalOrdered) return "PARTIALLY_RECEIVED"
    return "COMPLETED"
  }

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Job Delivery Management</h1>
        <p className="text-muted-foreground mt-2">Record deliveries and track job completion progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Job</CardTitle>
              <CardDescription>Choose a job to record deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedJobId} onValueChange={handleJobSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {activeJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          Job #{job.id} - {job.artisan}
                        </span>
                        <Badge className={`ml-2 ${getStatusColor(getJobStatus(job))}`}>
                          {getJobStatus(job).replace("_", " ")}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Job Items */}
          {selectedJob && (
            <Card>
              <CardHeader>
                <CardTitle>Job Items</CardTitle>
                <CardDescription>Select an item to record a delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedJob.items.map((item) => {
                    const remaining = getRemainingQuantity(item)
                    const completion = getCompletionPercentage(item)

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedItemId === item.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {item.productType.replace(/_/g, " ")}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {item.animalType} • {item.sizeCategory.replace(/_/g, " ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.unitPrice * item.quantityAccepted).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Current payment</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              Progress: {item.quantityReceived}/{item.quantityOrdered}
                            </span>
                            <span>{completion.toFixed(0)}% complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${completion}%` }}></div>
                          </div>
                          {remaining > 0 && (
                            <p className="text-xs text-muted-foreground">{remaining} pieces remaining to deliver</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Form */}
          {selectedItem && getRemainingQuantity(selectedItem) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Record New Delivery</CardTitle>
                <CardDescription>
                  Add a delivery for {selectedItem.productType.replace(/_/g, " ")} - {selectedItem.animalType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantityReceived">Quantity Received</Label>
                      <Input
                        id="quantityReceived"
                        type="number"
                        min="1"
                        max={getRemainingQuantity(selectedItem)}
                        value={newDelivery.quantityReceived || ""}
                        onChange={(e) =>
                          setNewDelivery({
                            ...newDelivery,
                            quantityReceived: Number.parseInt(e.target.value) || 0,
                            quantityAccepted: Math.min(
                              Number.parseInt(e.target.value) || 0,
                              newDelivery.quantityAccepted,
                            ),
                          })
                        }
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max: {getRemainingQuantity(selectedItem)} pieces
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="quantityAccepted">Quantity Accepted</Label>
                      <Input
                        id="quantityAccepted"
                        type="number"
                        min="0"
                        max={newDelivery.quantityReceived}
                        value={newDelivery.quantityAccepted || ""}
                        onChange={(e) =>
                          setNewDelivery({
                            ...newDelivery,
                            quantityAccepted: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {newDelivery.quantityAccepted < newDelivery.quantityReceived && (
                    <div>
                      <Label htmlFor="rejectionReason">Rejection Reason</Label>
                      <Select
                        value={newDelivery.rejectionReason}
                        onValueChange={(value) => setNewDelivery({ ...newDelivery, rejectionReason: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason for rejection" />
                        </SelectTrigger>
                        <SelectContent>
                          {rejectionReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Delivery Notes</Label>
                    <Textarea
                      id="notes"
                      value={newDelivery.notes}
                      onChange={(e) => setNewDelivery({ ...newDelivery, notes: e.target.value })}
                      placeholder="Any notes about this delivery..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleAddDelivery} disabled={newDelivery.quantityReceived === 0} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery History */}
          {selectedItem && selectedItem.deliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>Previous deliveries for this item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedItem.deliveries.map((delivery: any) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Received: {delivery.quantityReceived}, Accepted: {delivery.quantityAccepted}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(delivery.deliveryDate).toLocaleDateString()}
                          </p>
                          {delivery.notes && <p className="text-xs text-muted-foreground mt-1">{delivery.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        {delivery.rejectionReason && (
                          <Badge variant="destructive" className="text-xs">
                            {rejectionReasons.find((r) => r.value === delivery.rejectionReason)?.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Panel */}
        <div>
          {selectedJob && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
                <CardDescription>Job #{selectedJob.id} progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Artisan</Label>
                  <p className="text-sm text-muted-foreground">{selectedJob.artisan}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Service Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedJob.serviceCategory}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(getJobStatus(selectedJob))}>
                    {getJobStatus(selectedJob).replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Ordered:</span>
                    <span className="font-medium">
                      {selectedJob.items.reduce((sum, item) => sum + item.quantityOrdered, 0)} pieces
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Received:</span>
                    <span className="font-medium">
                      {selectedJob.items.reduce((sum, item) => sum + item.quantityReceived, 0)} pieces
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Accepted:</span>
                    <span className="font-medium">
                      {selectedJob.items.reduce((sum, item) => sum + item.quantityAccepted, 0)} pieces
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Original Payment:</span>
                      <span className="font-medium">
                        $
                        {selectedJob.items
                          .reduce((sum, item) => sum + item.unitPrice * item.quantityOrdered, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Payment:</span>
                      <span className="font-medium text-green-600">
                        $
                        {selectedJob.items
                          .reduce((sum, item) => sum + item.unitPrice * item.quantityAccepted, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedItem && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Selected Item</Label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">
                        {selectedItem.productType.replace(/_/g, " ")} - {selectedItem.animalType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedItem.quantityReceived}/{selectedItem.quantityOrdered} received
                      </p>
                      <p className="text-xs text-muted-foreground">{getRemainingQuantity(selectedItem)} remaining</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
