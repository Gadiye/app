"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, FileText, Clock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const artisans = [
  { id: 1, name: "John Smith", phone: "+1 (555) 123-4567" },
  { id: 2, name: "Maria Garcia", phone: "+1 (555) 234-5678" },
  { id: 3, name: "Carlos Rodriguez", phone: "+1 (555) 345-6789" },
  { id: 4, name: "Anna Johnson", phone: "+1 (555) 456-7890" },
  { id: 5, name: "David Chen", phone: "+1 (555) 567-8901" },
]

const serviceCategories = ["CARVING", "CUTTING", "PAINTING", "SANDING", "FINISHING"]

const payslips = [
  {
    id: 1,
    artisan: "John Smith",
    serviceCategory: "CARVING",
    generatedDate: "2024-01-20",
    totalPayment: 1250.0,
    periodStart: "2024-01-01",
    periodEnd: "2024-01-15",
    pdfFile: "payslip_john_smith_20240120.pdf",
    jobCount: 5,
  },
  {
    id: 2,
    artisan: "Maria Garcia",
    serviceCategory: "PAINTING",
    generatedDate: "2024-01-19",
    totalPayment: 980.0,
    periodStart: "2024-01-01",
    periodEnd: "2024-01-15",
    pdfFile: "payslip_maria_garcia_20240119.pdf",
    jobCount: 4,
  },
  {
    id: 3,
    artisan: "Carlos Rodriguez",
    serviceCategory: "FINISHING",
    generatedDate: "2024-01-18",
    totalPayment: 1450.0,
    periodStart: "2024-01-01",
    periodEnd: "2024-01-15",
    pdfFile: "payslip_carlos_rodriguez_20240118.pdf",
    jobCount: 6,
  },
  {
    id: 4,
    artisan: "Anna Johnson",
    serviceCategory: "SANDING",
    generatedDate: "2024-01-17",
    totalPayment: 750.0,
    periodStart: "2024-01-01",
    periodEnd: "2024-01-15",
    pdfFile: "payslip_anna_johnson_20240117.pdf",
    jobCount: 3,
  },
]

const pendingPayments = [
  {
    artisan: "John Smith",
    serviceCategory: "CARVING",
    jobCount: 3,
    totalAmount: 890.0,
    oldestJob: "2024-01-16",
  },
  {
    artisan: "Maria Garcia",
    serviceCategory: "PAINTING",
    jobCount: 2,
    totalAmount: 640.0,
    oldestJob: "2024-01-17",
  },
  {
    artisan: "David Chen",
    serviceCategory: "CUTTING",
    jobCount: 4,
    totalAmount: 520.0,
    oldestJob: "2024-01-15",
  },
]

export default function PayslipsPage() {
  const [selectedArtisan, setSelectedArtisan] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [periodStart, setPeriodStart] = useState<Date>()
  const [periodEnd, setPeriodEnd] = useState<Date>()
  const [generationType, setGenerationType] = useState<"individual" | "bulk">("individual")

  const totalPayslips = payslips.length
  const totalPayments = payslips.reduce((sum, p) => sum + p.totalPayment, 0)
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0)

  const handleGeneratePayslip = () => {
    if (generationType === "individual" && selectedArtisan && periodStart && periodEnd) {
      // In real app, this would call your backend API
      console.log("Generating individual payslip:", {
        artisan: selectedArtisan,
        periodStart,
        periodEnd,
      })
    } else if (generationType === "bulk" && selectedService && periodStart && periodEnd) {
      // In real app, this would call your backend API
      console.log("Generating bulk payslips:", {
        serviceCategory: selectedService,
        periodStart,
        periodEnd,
      })
    }
  }

  const handleDownloadPayslip = (filename: string) => {
    // In real app, this would download the actual PDF file
    console.log("Downloading payslip:", filename)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payslip Management</h1>
        <p className="text-muted-foreground mt-2">Generate and manage artisan payslips</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayslips}</div>
            <p className="text-xs text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid out this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payslip generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Artisans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artisans.length}</div>
            <p className="text-xs text-muted-foreground">With pending work</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="generate">
            <Plus className="h-4 w-4 mr-2" />
            Generate Payslips
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="h-4 w-4 mr-2" />
            Payslip History
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending Payments
          </TabsTrigger>
        </TabsList>

        {/* Generate Payslips Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Payslips</CardTitle>
              <CardDescription>Create individual or bulk payslips for artisans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generation Type Selection */}
              <div>
                <Label className="text-base font-medium">Generation Type</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="individual"
                      name="generationType"
                      checked={generationType === "individual"}
                      onChange={() => setGenerationType("individual")}
                    />
                    <Label htmlFor="individual">Individual Artisan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bulk"
                      name="generationType"
                      checked={generationType === "bulk"}
                      onChange={() => setGenerationType("bulk")}
                    />
                    <Label htmlFor="bulk">Bulk by Service Category</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selection */}
                <div className="space-y-4">
                  {generationType === "individual" ? (
                    <div>
                      <Label htmlFor="artisan">Select Artisan</Label>
                      <Select value={selectedArtisan} onValueChange={setSelectedArtisan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an artisan" />
                        </SelectTrigger>
                        <SelectContent>
                          {artisans.map((artisan) => (
                            <SelectItem key={artisan.id} value={artisan.id.toString()}>
                              {artisan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="service">Select Service Category</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service category" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                  <div>
                    <Label>Period Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !periodStart && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {periodStart ? format(periodStart, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={periodStart} onSelect={setPeriodStart} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Period End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !periodEnd && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {periodEnd ? format(periodEnd, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={periodEnd} onSelect={setPeriodEnd} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGeneratePayslip}
                  disabled={
                    !periodStart ||
                    !periodEnd ||
                    (generationType === "individual" && !selectedArtisan) ||
                    (generationType === "bulk" && !selectedService)
                  }
                  className="w-full md:w-auto"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate {generationType === "bulk" ? "Bulk " : ""}Payslip{generationType === "bulk" ? "s" : ""}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payslip History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payslip History</CardTitle>
              <CardDescription>All generated payslips</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artisan</TableHead>
                    <TableHead>Service Category</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Total Payment</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">{payslip.artisan}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payslip.serviceCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{payslip.periodStart}</div>
                          <div className="text-muted-foreground">to {payslip.periodEnd}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payslip.jobCount} jobs</TableCell>
                      <TableCell className="font-medium">${payslip.totalPayment.toFixed(2)}</TableCell>
                      <TableCell>{payslip.generatedDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPayslip(payslip.pdfFile)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Payments Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Artisans with completed work awaiting payslip generation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artisan</TableHead>
                    <TableHead>Service Category</TableHead>
                    <TableHead>Completed Jobs</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Oldest Job</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((pending, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pending.artisan}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pending.serviceCategory}</Badge>
                      </TableCell>
                      <TableCell>{pending.jobCount} jobs</TableCell>
                      <TableCell className="font-medium">${pending.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{pending.oldestJob}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
