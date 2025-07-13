"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useProducts } from '@/hooks/useResource';
import { api, Product } from '@/lib/api';

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

export default function PricingPage() {
  const { data: products, loading, error, refetch } = useProducts();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrice, setNewPrice] = useState({
    product_type: "",
    animal_type: "",
    service_category: "",
    size_category: "MEDIUM",
    base_price: "",
  });

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleSave = async (id: number, updatedPrice: number) => {
    try {
      await api.products.update(id, { base_price: updatedPrice });
      refetch();
      setEditingId(null);
    } catch (err: any) {
      alert(`Failed to update price: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAddPrice = async () => {
    if (newPrice.product_type && newPrice.animal_type && newPrice.service_category && newPrice.base_price) {
      try {
        await api.products.create({
          product_type: newPrice.product_type,
          animal_type: newPrice.animal_type,
          service_category: newPrice.service_category,
          size_category: newPrice.size_category,
          base_price: Number.parseFloat(newPrice.base_price),
        });
        refetch();
        setNewPrice({
          product_type: "",
          animal_type: "",
          service_category: "",
          size_category: "MEDIUM",
          base_price: "",
        });
        setShowAddForm(false);
      } catch (err: any) {
        alert(`Failed to add price: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred."}</AlertDescription>
        </Alert>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </div>
    );
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
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select
                    value={newPrice.product_type}
                    onValueChange={(value) => setNewPrice({ ...newPrice, product_type: value })}
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
                  <Label htmlFor="animal_type">Animal Type</Label>
                  <Select
                    value={newPrice.animal_type}
                    onValueChange={(value) => setNewPrice({ ...newPrice, animal_type: value })}
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
                  <Label htmlFor="service_category">Service</Label>
                  <Select
                    value={newPrice.service_category}
                    onValueChange={(value) => setNewPrice({ ...newPrice, service_category: value })}
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
                  <Label htmlFor="size_category">Size</Label>
                  <Select
                    value={newPrice.size_category}
                    onValueChange={(value) => setNewPrice({ ...newPrice, size_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeCategories.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.replace(/ /g, "_")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="base_price">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPrice.base_price}
                    onChange={(e) => setNewPrice({ ...newPrice, base_price: e.target.value })}
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
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Badge variant="outline">{product.product_type.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>{product.animal_type}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.service_category}</Badge>
                  </TableCell>
                  <TableCell>{product.size_category.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <PriceEditor
                        initialPrice={product.base_price}
                        onSave={(newPrice) => handleSave(product.id, newPrice)}
                        onCancel={handleCancel}
                      />
                    ) : (
                     <span className="font-medium">
                            ${Number(product.base_price).toFixed(2)}
                        </span>

                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? null : (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product.id)}>
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