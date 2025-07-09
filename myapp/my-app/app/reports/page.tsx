"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, PieChart, TrendingUp, DollarSign } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">Business insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker date={dateRange} setDate={setDateRange} />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-green-600 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342 items</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-green-600 font-medium">+8.2%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-red-600 font-medium">-1.2%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Artisans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">No change</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="production" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="production">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Production</span>
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="quality">
            <PieChart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Quality</span>
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Production Reports */}
        <TabsContent value="production">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production by Product Type</CardTitle>
                <CardDescription>Items produced by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ProductionBarChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production by Artisan</CardTitle>
                <CardDescription>Top performing artisans by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artisan</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Avg. Quality</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">John Smith</TableCell>
                      <TableCell>78</TableCell>
                      <TableCell>96.2%</TableCell>
                      <TableCell>$3,120.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Maria Garcia</TableCell>
                      <TableCell>65</TableCell>
                      <TableCell>94.8%</TableCell>
                      <TableCell>$2,600.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carlos Rodriguez</TableCell>
                      <TableCell>52</TableCell>
                      <TableCell>92.5%</TableCell>
                      <TableCell>$2,080.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Anna Johnson</TableCell>
                      <TableCell>48</TableCell>
                      <TableCell>95.1%</TableCell>
                      <TableCell>$1,920.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">David Chen</TableCell>
                      <TableCell>42</TableCell>
                      <TableCell>93.7%</TableCell>
                      <TableCell>$1,680.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product Category</CardTitle>
                <CardDescription>Financial breakdown by product type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <RevenueBarChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Revenue, costs, and margins</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline">SITTING_ANIMAL</Badge>
                      </TableCell>
                      <TableCell>$3,450.00</TableCell>
                      <TableCell>$1,725.00</TableCell>
                      <TableCell className="text-green-600">50%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline">ANIMAL_MASKS</Badge>
                      </TableCell>
                      <TableCell>$2,800.00</TableCell>
                      <TableCell>$1,540.00</TableCell>
                      <TableCell className="text-green-600">45%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline">YOGA_BOWLS</Badge>
                      </TableCell>
                      <TableCell>$2,200.00</TableCell>
                      <TableCell>$1,100.00</TableCell>
                      <TableCell className="text-green-600">50%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline">STANDING_ANIMAL</Badge>
                      </TableCell>
                      <TableCell>$2,100.00</TableCell>
                      <TableCell>$1,155.00</TableCell>
                      <TableCell className="text-green-600">45%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline">CHOPSTICK_HOLDERS</Badge>
                      </TableCell>
                      <TableCell>$1,900.00</TableCell>
                      <TableCell>$950.00</TableCell>
                      <TableCell className="text-green-600">50%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Reports */}
        <TabsContent value="quality">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Acceptance rates by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <QualityPieChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rejection Analysis</CardTitle>
                <CardDescription>Reasons for quality rejections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>% of Total</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quality Issues</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>60%</TableCell>
                      <TableCell>$480.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Damaged Items</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>25%</TableCell>
                      <TableCell>$200.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Other</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>15%</TableCell>
                      <TableCell>$120.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Common Quality Issues</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Inconsistent paint application</li>
                    <li>• Rough edges on carved pieces</li>
                    <li>• Uneven sanding on surfaces</li>
                    <li>• Misaligned features on animal figurines</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Reports */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Production Trends</CardTitle>
                <CardDescription>Production volume over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <TrendsLineChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Analysis</CardTitle>
                <CardDescription>Production patterns by month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>YoY Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">January</TableCell>
                      <TableCell>85 items</TableCell>
                      <TableCell>$3,400.00</TableCell>
                      <TableCell className="text-green-600">+12%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">February</TableCell>
                      <TableCell>78 items</TableCell>
                      <TableCell>$3,120.00</TableCell>
                      <TableCell className="text-green-600">+8%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">March</TableCell>
                      <TableCell>92 items</TableCell>
                      <TableCell>$3,680.00</TableCell>
                      <TableCell className="text-green-600">+15%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">April</TableCell>
                      <TableCell>87 items</TableCell>
                      <TableCell>$3,480.00</TableCell>
                      <TableCell className="text-green-600">+10%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Seasonal Insights</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Peak production occurs in Q4 (holiday season)</li>
                    <li>• Animal masks show 35% higher demand in October</li>
                    <li>• Yoga bowls trend upward in January (New Year)</li>
                    <li>• Summer months show preference for smaller items</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Simple chart components using HTML/CSS for visualization
// In a real app, you might use a charting library like Chart.js or Recharts

function ProductionBarChart() {
  const data = [
    { label: "Sitting Animal", value: 85, color: "bg-blue-500" },
    { label: "Animal Masks", value: 65, color: "bg-green-500" },
    { label: "Yoga Bowls", value: 55, color: "bg-yellow-500" },
    { label: "Standing Animal", value: 45, color: "bg-purple-500" },
    { label: "Chopstick Holders", value: 35, color: "bg-pink-500" },
  ]

  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full px-1">
            <div
              className={`w-full ${item.color} rounded-t`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs font-medium truncate">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RevenueBarChart() {
  const data = [
    { label: "Sitting Animal", value: 3450, color: "bg-blue-500" },
    { label: "Animal Masks", value: 2800, color: "bg-green-500" },
    { label: "Yoga Bowls", value: 2200, color: "bg-yellow-500" },
    { label: "Standing Animal", value: 2100, color: "bg-purple-500" },
    { label: "Chopstick Holders", value: 1900, color: "bg-pink-500" },
  ]

  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full px-1">
            <div
              className={`w-full ${item.color} rounded-t`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs font-medium truncate">{item.label}</div>
            <div className="text-xs text-muted-foreground">${item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QualityPieChart() {
  const data = [
    { label: "Accepted", value: 94.3, color: "bg-green-500" },
    { label: "Rejected", value: 5.7, color: "bg-red-500" },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-48 h-48">
        <div
          className="absolute inset-0 rounded-full bg-green-500"
          style={{ clipPath: "polygon(50% 50%, 0 0, 0 100%, 100% 100%, 100% 0)" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full bg-red-500"
          style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 20%, 50% 50%)" }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">94.3%</div>
              <div className="text-xs text-muted-foreground">Acceptance Rate</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-1`}></div>
            <span className="text-sm">
              {item.label}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendsLineChart() {
  const data = [
    { month: "Jan", value: 85 },
    { month: "Feb", value: 78 },
    { month: "Mar", value: 92 },
    { month: "Apr", value: 87 },
    { month: "May", value: 95 },
    { month: "Jun", value: 90 },
  ]

  const maxValue = Math.max(...data.map((item) => item.value))
  const minValue = Math.min(...data.map((item) => item.value))
  const range = maxValue - minValue

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end">
          {data.map((item, index) => {
            const height = ((item.value - minValue) / range) * 80 + 10
            const prevHeight = index > 0 ? ((data[index - 1].value - minValue) / range) * 80 + 10 : height

            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                {index > 0 && (
                  <div
                    className="absolute bg-blue-500"
                    style={{
                      height: "2px",
                      width: `${100 / data.length}%`,
                      bottom: `${prevHeight}%`,
                      left: `${(index - 0.5) * (100 / data.length)}%`,
                      transform: `rotate(${Math.atan2(height - prevHeight, 100 / data.length) * (180 / Math.PI)}deg)`,
                      transformOrigin: "0 50%",
                    }}
                  ></div>
                )}
                <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs font-medium">{item.month}</div>
            <div className="text-xs text-muted-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
