"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data
const customers = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@email.com" },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com" },
  { id: 3, name: "Emily Rodriguez", email: "emily.r@email.com" },
  { id: 4, name: "David Wilson", email: "d.wilson@email.com" },
]

const finishedProducts = [
  {
    id: 1,
    productType: "SITTING_ANIMAL",
    animalType: "Elephant",
    sizeCategory: "MEDIUM",
    price: 45.0,
    stockQuantity: 12,
  },
  {
    id: 2,
    productType: "ANIMAL_MASKS",
    animalType: "Lion",
    sizeCategory: "LARGE",
    price: 55.0,
    stockQuantity: 8,
  },
  {
    id: 3,
    productType: "YOGA_BOWLS",
    animalType: "Generic",
    sizeCategory: "MEDIUM",
    price: 35.0,
    stockQuantity: 15,
  },
  {
    id: 4,
    productType: "STANDING_ANIMAL",
    animalType: "Giraffe",
    sizeCategory: "LARGE",
    price: 60.0,
    stockQuantity: 6,
  },
  {
    id: 5,
    productType: "CHOPSTICK_HOLDERS",
    animalType: "Bird",
    sizeCategory: "SMALL",
    price: 25.0,
    stockQuantity: 20,
  },
]

interface OrderItem {
  id: string
  productId: number
  quantity: number
  unitPrice: number
  subtotal: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [customerId, setCustomerId] = useState("")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
  })

  const addOrderItem = () => {
    if (currentItem.productId) {
      const product = finishedProducts.find((p) => p.id.toString() === currentItem.productId)
      if (product && currentItem.quantity <= product.stockQuantity) {
        const newItem: OrderItem = {
          id: Date.now().toString(),
          productId: product.id,
          quantity: currentItem.quantity,
          unitPrice: product.price,
          subtotal: product.price * currentItem.quantity,
        }

        setOrderItems([...orderItems, newItem])
        setCurrentItem({ productId: "", quantity: 1 })
      }
    }
  }

  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id))
  }

  const getProductInfo = (productId: number) => {
    return finishedProducts.find((p) => p.id === productId)
  }

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id.toString() === customerId)?.name || "Unknown"
  }

  const totalOrderValue = orderItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = () => {
    if (orderItems.length > 0 && customerId) {
      // In real app, this would submit to your backend
      console.log("Creating order:", { customerId, notes, orderItems })
      router.push("/orders")
    }
  }

  const selectedProduct = currentItem.productId
    ? finishedProducts.find((p) => p.id.toString() === currentItem.productId)
    : null

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Order</h1>
        <p className="text-muted-foreground mt-2">Create a new customer order from finished stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Setup */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Set up the basic order information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for this order..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
              <CardDescription>Add finished products to the order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={currentItem.productId}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {finishedProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.productType.replace(/_/g, " ")} - {product.animalType} ({product.sizeCategory}) - $
                          {product.price} (Stock: {product.stockQuantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct?.stockQuantity || 1}
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Unit Price:</span> ${selectedProduct.price.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Available Stock:</span> {selectedProduct.stockQuantity}
                    </div>
                    <div>
                      <span className="font-medium">Subtotal:</span> $
                      {(selectedProduct.price * currentItem.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={addOrderItem} disabled={!currentItem.productId || !selectedProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Add to Order
              </Button>
            </CardContent>
          </Card>

          {/* Order Items List */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({orderItems.length})</CardTitle>
                <CardDescription>Products in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderItems.map((item) => {
                    const product = getProductInfo(item.productId)
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{product?.productType.replace(/_/g, " ")}</Badge>
                            <Badge variant="secondary">{product?.animalType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product?.sizeCategory} • Qty: {item.quantity} • ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeOrderItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review before creating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Customer</Label>
                <p className="text-sm text-muted-foreground">
                  {customerId ? getCustomerName(customerId) : "Not selected"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Total Items</Label>
                <p className="text-sm text-muted-foreground">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)} pieces
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Product Types</Label>
                <p className="text-sm text-muted-foreground">
                  {new Set(orderItems.map((item) => getProductInfo(item.productId)?.productType)).size} different
                  products
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Total Order Value</Label>
                  <span className="text-lg font-bold">${totalOrderValue.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={orderItems.length === 0 || !customerId}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
