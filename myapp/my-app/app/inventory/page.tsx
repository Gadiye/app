"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProducts, useFinishedStock } from '@/hooks/useResource';

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
  const { data: products, loading: productsLoading, error: productsError } = useProducts();
  const { data: finishedStock, loading: finishedStockLoading, error: finishedStockError } = useFinishedStock();

  const [selectedProductType, setSelectedProductType] = useState("all");
  const [selectedAnimalType, setSelectedAnimalType] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");

  const safeProducts = products || []; // useProducts is already returning an array
  const safeFinishedStock = Array.isArray(finishedStock) ? finishedStock : [];

  const filteredInventory = useMemo(() => {
    let filtered = safeProducts;

    if (selectedProductType !== "all") {
      filtered = filtered.filter(item => item.product_type === selectedProductType);
    }
    if (selectedAnimalType !== "all") {
      filtered = filtered.filter(item => item.animal_type === selectedAnimalType);
    }
    if (selectedStage !== "all") {
      filtered = filtered.filter(item => item.service_category === selectedStage);
    }
    return filtered;
  }, [safeProducts, selectedProductType, selectedAnimalType, selectedStage]);

  const totalInventoryValue = filteredInventory.reduce((sum, item) => sum + (item.base_price || 0), 0);
  const totalItems = filteredInventory.length;

  // These statistics are not directly available from the current APIs, setting to 0 or N/A
  const readyForNextStage = "N/A"; 
  const finishedProductsCount = safeFinishedStock.length;

  const productTypesOptions = useMemo(() => {
    const types = new Set<string>();
    safeProducts.forEach(p => types.add(p.product_type));
    return ["all", ...Array.from(types)];
  }, [safeProducts]);

  const animalTypesOptions = useMemo(() => {
    const types = new Set<string>();
    safeProducts.forEach(p => types.add(p.animal_type));
    return ["all", ...Array.from(types)];
  }, [safeProducts]);

  if (productsLoading || finishedStockLoading) {
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

  if (productsError || finishedStockError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{productsError instanceof Error ? productsError.message : finishedStockError instanceof Error ? finishedStockError.message : "An unknown error occurred."}</AlertDescription>
        </Alert>
        <Button onClick={() => { /* refetchProducts(); refetchFinishedStock(); */ }} className="mt-4">Retry</Button>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{readyForNextStage}</div>
            <p className="text-xs text-muted-foreground">Items awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Finished Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedProductsCount}</div>
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
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Product Types" />
                </SelectTrigger>
                <SelectContent>
                  {productTypesOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Product Types" : type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedAnimalType} onValueChange={setSelectedAnimalType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Animals" />
                </SelectTrigger>
                <SelectContent>
                  {animalTypesOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Animals" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
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
              {filteredInventory.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.product_type.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>{item.animal_type}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(item.service_category)}`}
                    >
                      {item.service_category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity || "N/A"}</TableCell>
                  <TableCell className="text-right">${(item.average_cost || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${((item.quantity || 0) * (item.average_cost || 0)).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(item.last_price_update).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}