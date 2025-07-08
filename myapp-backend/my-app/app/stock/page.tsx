import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react"

// Mock finished stock data
const finishedStock = [
  {
    id: 1,
    productType: "SITTING_ANIMAL",
    animalType: "Elephant",
    sizeCategory: "MEDIUM",
    quantity: 12,
    averageCost: 30.0,
    sellingPrice: 45.0,
    totalValue: 360.0,
    lastUpdated: "2024-01-20",
    reorderLevel: 5,
    status: "IN_STOCK",
  },
  {
    id: 2,
    productType: "ANIMAL_MASKS",
    animalType: "Lion",
    sizeCategory: "LARGE",
    quantity: 8,
    averageCost: 35.0,
    sellingPrice: 55.0,
    totalValue: 280.0,
    lastUpdated: "2024-01-19",
    reorderLevel: 10,
    status: "IN_STOCK",
  },
  {
    id: 3,
    productType: "YOGA_BOWLS",
    animalType: "Generic",
    sizeCategory: "MEDIUM",
    quantity: 3,
    averageCost: 25.0,
    sellingPrice: 35.0,
    totalValue: 75.0,
    lastUpdated: "2024-01-18",
    reorderLevel: 8,
    status: "LOW_STOCK",
  },
  {
    id: 4,
    productType: "STANDING_ANIMAL",
    animalType: "Giraffe",
    sizeCategory: "LARGE",
    quantity: 0,
    averageCost: 40.0,
    sellingPrice: 60.0,
    totalValue: 0.0,
    lastUpdated: "2024-01-17",
    reorderLevel: 5,
    status: "OUT_OF_STOCK",
  },
  {
    id: 5,
    productType: "CHOPSTICK_HOLDERS",
    animalType: "Bird",
    sizeCategory: "SMALL",
    quantity: 20,
    averageCost: 15.0,
    sellingPrice: 25.0,
    totalValue: 300.0,
    lastUpdated: "2024-01-16",
    reorderLevel: 10,
    status: "IN_STOCK",
  },
]

function getStockStatusColor(status: string) {
  switch (status) {
    case "IN_STOCK":
      return "default"
    case "LOW_STOCK":
      return "secondary"
    case "OUT_OF_STOCK":
      return "destructive"
    default:
      return "secondary"
  }
}

function getStockStatusIcon(status: string) {
  switch (status) {
    case "IN_STOCK":
      return <Package className="h-4 w-4" />
    case "LOW_STOCK":
      return <TrendingDown className="h-4 w-4" />
    case "OUT_OF_STOCK":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

export default function FinishedStockPage() {
  const totalItems = finishedStock.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = finishedStock.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockItems = finishedStock.filter((item) => item.status === "LOW_STOCK").length
  const outOfStockItems = finishedStock.filter((item) => item.status === "OUT_OF_STOCK").length

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Finished Stock</h1>
        <p className="text-muted-foreground mt-2">Manage finished products ready for customer orders</p>
      </div>

      {/* Stock Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-yellow-700">Items that need attention for restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {finishedStock
                .filter((item) => item.status === "OUT_OF_STOCK" || item.status === "LOW_STOCK")
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.productType.replace(/_/g, " ")}</Badge>
                      <span className="text-sm">
                        {item.animalType} ({item.sizeCategory})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item.quantity} / {item.reorderLevel} minimum
                      </span>
                      <Badge variant={getStockStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Finished Stock Inventory</CardTitle>
          <CardDescription>All finished products available for customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishedStock.map((item) => {
                const margin = ((item.sellingPrice - item.averageCost) / item.sellingPrice) * 100
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.productType.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>{item.animalType}</TableCell>
                    <TableCell>{item.sizeCategory}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity}
                      {item.quantity <= item.reorderLevel && item.quantity > 0 && (
                        <span className="text-yellow-600 ml-1">⚠</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">${item.averageCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${item.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {margin > 40 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={margin > 40 ? "text-green-600" : "text-red-600"}>{margin.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">${item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStockStatusColor(item.status)} className="flex items-center gap-1 w-fit">
                        {getStockStatusIcon(item.status)}
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
