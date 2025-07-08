import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

// Mock inventory data
const inventoryData = [
  {
    id: 1,
    productType: "SITTING_ANIMAL",
    animalType: "Elephant",
    serviceCategory: "CARVED",
    quantity: 25,
    averageCost: 30.0,
    totalValue: 750.0,
    lastUpdated: "2024-01-15",
  },
  {
    id: 2,
    productType: "ANIMAL_MASKS",
    animalType: "Lion",
    serviceCategory: "PAINTED",
    quantity: 12,
    averageCost: 40.0,
    totalValue: 480.0,
    lastUpdated: "2024-01-14",
  },
  {
    id: 3,
    productType: "YOGA_BOWLS",
    animalType: "Generic",
    serviceCategory: "FINISHED",
    quantity: 8,
    averageCost: 45.0,
    totalValue: 360.0,
    lastUpdated: "2024-01-13",
  },
  {
    id: 4,
    productType: "STANDING_ANIMAL",
    animalType: "Giraffe",
    serviceCategory: "SANDED",
    quantity: 15,
    averageCost: 35.0,
    totalValue: 525.0,
    lastUpdated: "2024-01-12",
  },
  {
    id: 5,
    productType: "CHOPSTICK_HOLDERS",
    animalType: "Bird",
    serviceCategory: "CARVED",
    quantity: 30,
    averageCost: 20.0,
    totalValue: 600.0,
    lastUpdated: "2024-01-11",
  },
]

const serviceStages = ["CARVED", "SANDED", "PAINTED", "FINISHED"]

function getStageColor(stage: string) {
  const colors: Record<string, string> = {
    CARVED: "bg-blue-100 text-blue-800",
    SANDED: "bg-yellow-100 text-yellow-800",
    PAINTED: "bg-purple-100 text-purple-800",
    FINISHED: "bg-green-100 text-green-800",
  }
  return colors[stage] || "bg-gray-100 text-gray-800"
}

export default function InventoryPage() {
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.totalValue, 0)
  const totalItems = inventoryData.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track stock levels across production stages</p>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Inventory valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready for Next Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Items awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Finished Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Ready for sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inventory Filters</CardTitle>
          <CardDescription>Filter inventory by product type, animal, or stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Product Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Product Types</SelectItem>
                  <SelectItem value="SITTING_ANIMAL">Sitting Animal</SelectItem>
                  <SelectItem value="YOGA_BOWLS">Yoga Bowls</SelectItem>
                  <SelectItem value="ANIMAL_MASKS">Animal Masks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Animals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Animals</SelectItem>
                  <SelectItem value="Elephant">Elephant</SelectItem>
                  <SelectItem value="Lion">Lion</SelectItem>
                  <SelectItem value="Giraffe">Giraffe</SelectItem>
                  <SelectItem value="Bird">Bird</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {serviceStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>All items currently in stock</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Product Type
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg. Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.productType.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>{item.animalType}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(item.serviceCategory)}`}
                    >
                      {item.serviceCategory}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.averageCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${item.totalValue.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
