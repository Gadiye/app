import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Package, Truck, CheckCircle, Clock } from "lucide-react"

// Mock order data
const orders = [
  {
    id: 1001,
    customer: "Sarah Johnson",
    createdDate: "2024-01-20",
    status: "DELIVERED",
    totalAmount: 450.0,
    itemCount: 3,
    shippingAddress: "123 Main St, Anytown, ST 12345",
  },
  {
    id: 1002,
    customer: "Michael Chen",
    createdDate: "2024-01-19",
    status: "SHIPPED",
    totalAmount: 320.0,
    itemCount: 2,
    shippingAddress: "456 Oak Ave, Another City, ST 67890",
  },
  {
    id: 1003,
    customer: "Emily Rodriguez",
    createdDate: "2024-01-18",
    status: "PROCESSING",
    totalAmount: 675.0,
    itemCount: 5,
    shippingAddress: "789 Pine Rd, Somewhere, ST 13579",
  },
  {
    id: 1004,
    customer: "David Wilson",
    createdDate: "2024-01-17",
    status: "PENDING",
    totalAmount: 240.0,
    itemCount: 2,
    shippingAddress: "321 Elm St, Elsewhere, ST 24680",
  },
  {
    id: 1005,
    customer: "Lisa Anderson",
    createdDate: "2024-01-16",
    status: "CANCELLED",
    totalAmount: 180.0,
    itemCount: 1,
    shippingAddress: "654 Maple Dr, Nowhere, ST 97531",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="h-4 w-4" />
    case "PROCESSING":
      return <Package className="h-4 w-4" />
    case "SHIPPED":
      return <Truck className="h-4 w-4" />
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "secondary"
    case "PROCESSING":
      return "default"
    case "SHIPPED":
      return "default"
    case "DELIVERED":
      return "default"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function OrdersPage() {
  const totalOrders = orders.length
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length
  const processingOrders = orders.filter((order) => order.status === "PROCESSING").length
  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage customer orders</p>
          </div>
          <Link href="/orders/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingOrders}</div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Complete list of customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.shippingAddress.split(",")[0]}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.createdDate}</TableCell>
                  <TableCell>{order.itemCount} items</TableCell>
                  <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
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
