"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Plus } from "lucide-react"

const productTypes = [
  "SITTING_ANIMAL",
  "YOGA_BOWLS",
  "YOGA_ANIMALS",
  "CHOPSTICK_HOLDERS",
  "STANDING_ANIMAL",
  "BOTTLE_CORKS",
  "SANTA_YOGA_BOWLS",
  "SANTA_YOGA_ANIMALS",
  "HEAD_BOWLS",
  "DRINKING_BOWLS",
  "ANIMAL_MASKS",
  "CHOPSTICK_HEADS",
  "CHESS_UNITS",
  "STOOL_SET",
  "SALAD_SERVERS_PAIR",
  "WALKING_ANIMAL",
  "PLACE_CARD_HOLDER",
]

const animalTypes = ["Elephant", "Lion", "Giraffe", "Bird", "Generic"]

const serviceCategories = ["CARVING", "CUTTING", "PAINTING", "SANDING", "FINISHING", "FINISHED"]

const sizeCategories = [
  "SMALL",
  "MEDIUM",
  "LARGE",
  "WITH CLOTHES",
  "WITH DRESS",
  "WITH SUIT",
  "WITH OVERALL",
  "4IN",
  "8X8",
  "6X6",
  "5X4",
  "XMAS DRESS",
  "IN PAIRS",
  "12IN",
  "8IN",
  "N/A",
]

// Mock data
const initialPrices = [
  {
    id: 1,
    productType: "SITTING_ANIMAL",
    animalType: "Elephant",
    serviceCategory: "CARVING",
    sizeCategory: "MEDIUM",
    price: 25.0,
  },
  {
    id: 2,
    productType: "SITTING_ANIMAL",
    animalType: "Lion",
    serviceCategory: "CARVING",
    sizeCategory: "MEDIUM",
    price: 22.0,
  },
  {
    id: 3,
    productType: "YOGA_BOWLS",
    animalType: "Generic",
    serviceCategory: "CARVING",
    sizeCategory: "SMALL",
    price: 15.0,
  },
  {
    id: 4,
    productType: "ANIMAL_MASKS",
    animalType: "Lion",
    serviceCategory: "PAINTING",
    sizeCategory: "LARGE",
    price: 35.0,
  },
  {
    id: 5,
    productType: "STANDING_ANIMAL",
    animalType: "Giraffe",
    serviceCategory: "FINISHING",
    sizeCategory: "LARGE",
    price: 40.0,
  },
]

export default function PricingPage() {
  const [prices, setPrices] = useState(initialPrices)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrice, setNewPrice] = useState({
    productType: "",
    animalType: "",
    serviceCategory: "",
    sizeCategory: "MEDIUM",
    price: "",
  })

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleSave = (id: number, updatedPrice: number) => {
    setPrices(prices.map((p) => (p.id === id ? { ...p, price: updatedPrice } : p)))
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleAddPrice = () => {
    if (newPrice.productType && newPrice.animalType && newPrice.serviceCategory && newPrice.price) {
      const price = {
        id: Math.max(...prices.map((p) => p.id)) + 1,
        productType: newPrice.productType,
        animalType: newPrice.animalType,
        serviceCategory: newPrice.serviceCategory,
        sizeCategory: newPrice.sizeCategory,
        price: Number.parseFloat(newPrice.price),
      }
      setPrices([...prices, price])
      setNewPrice({
        productType: "",
        animalType: "",
        serviceCategory: "",
        sizeCategory: "MEDIUM",
        price: "",
      })
      setShowAddForm(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Price Management</h1>
        <p className="text-muted-foreground mt-2">Manage base prices for all product combinations</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Master Price Sheet</CardTitle>
              <CardDescription>
                Base prices for Product Type × Animal Type × Service Category combinations
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Price
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-4">Add New Price</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={newPrice.productType}
                    onValueChange={(value) => setNewPrice({ ...newPrice, productType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="animalType">Animal Type</Label>
                  <Select
                    value={newPrice.animalType}
                    onValueChange={(value) => setNewPrice({ ...newPrice, animalType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animalTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceCategory">Service</Label>
                  <Select
                    value={newPrice.serviceCategory}
                    onValueChange={(value) => setNewPrice({ ...newPrice, serviceCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
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
                <div>
                  <Label htmlFor="sizeCategory">Size</Label>
                  <Select
                    value={newPrice.sizeCategory}
                    onValueChange={(value) => setNewPrice({ ...newPrice, sizeCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeCategories.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddPrice}>Add Price</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Type</TableHead>
                <TableHead>Animal Type</TableHead>
                <TableHead>Service Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>
                    <Badge variant="outline">{price.productType.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>{price.animalType}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{price.serviceCategory}</Badge>
                  </TableCell>
                  <TableCell>{price.sizeCategory.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    {editingId === price.id ? (
                      <PriceEditor
                        initialPrice={price.price}
                        onSave={(newPrice) => handleSave(price.id, newPrice)}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <span className="font-medium">${price.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === price.id ? null : (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(price.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
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

function PriceEditor({
  initialPrice,
  onSave,
  onCancel,
}: {
  initialPrice: number
  onSave: (price: number) => void
  onCancel: () => void
}) {
  const [price, setPrice] = useState(initialPrice.toString())

  const handleSave = () => {
    const numPrice = Number.parseFloat(price)
    if (!isNaN(numPrice) && numPrice > 0) {
      onSave(numPrice)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-20" />
      <Button size="sm" onClick={handleSave}>
        <Save className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
