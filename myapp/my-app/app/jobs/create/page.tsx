"use client"

import { useState, useEffect, useCallback } from "react" // Added useEffect and useCallback
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator, Check, Loader2 } from "lucide-react" // Added Loader2
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert for errors
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton for loading

// Import API hooks and types
import {
  useArtisans,
  useCreateJob,
  // useProductPrices, // Uncomment if you create a backend endpoint for prices
  Artisan,
  JobItemPayload,
  CreateJobPayload,
} from '@/hooks/useApi'; // Adjust the path as per your file structure

// --- CONSTANTS (These are good to keep client-side if they're static) ---
const PRODUCT_TYPES = [
  "SITTING_ANIMAL", "YOGA_BOWLS", "PER_DAY", "YOGA_ANIMALS", "CHOPSTICK_HOLDERS",
  "STANDING_ANIMAL", "BOTTLE_CORKS", "SANTA_YOGA_BOWLS", "SANTA_YOGA_ANIMALS",
  "HEAD_BOWLS", "DRINKING_BOWLS", "ANIMAL_MASKS", "CHOPSTICK_HEADS",
  "CHESS_UNITS", "STOOL_SET", "SALAD_SERVERS_PAIR", "WALKING_ANIMAL",
  "PLACE_CARD_HOLDER",
]

const SERVICE_CATEGORIES = ["CARVING", "CUTTING", "PAINTING", "SANDING", "FINISHING", "FINISHED"]

const SIZE_CATEGORIES = [
  "SMALL", "MEDIUM", "LARGE", "WITH_CLOTHES", "WITH_DRESS", "WITH_SUIT",
  "WITH_OVERALL", "4IN", "8X8", "6X6", "5X4", "XMAS_DRESS", "IN_PAIRS", "12IN", "8IN", "N/A",
]

const ANIMAL_TYPES = ["Elephant", "Lion", "Giraffe", "Bird", "Zebra", "Monkey", "Rhino", "Generic"]

// --- MOCK PRODUCT PRICING (THIS NEEDS TO BE MOVED TO BACKEND OR A DYNAMIC FETCH) ---
// For now, we'll keep it as a mock, but ideally, this would come from your Django API
const mockProductPrices = [
  { productType: "SITTING_ANIMAL", animalType: "Elephant", serviceCategory: "CARVING", sizeCategory: "MEDIUM", price: 30.0 },
  { productType: "SITTING_ANIMAL", animalType: "Lion", serviceCategory: "CARVING", sizeCategory: "MEDIUM", price: 28.0 },
  { productType: "ANIMAL_MASKS", animalType: "Lion", serviceCategory: "CARVING", sizeCategory: "LARGE", price: 40.0 },
  { productType: "YOGA_BOWLS", animalType: "Generic", serviceCategory: "CARVING", sizeCategory: "MEDIUM", price: 25.0 },
  // Default fallback prices by service category (CRUCIAL TO HAVE THESE ON BACKEND)
  { productType: "*", animalType: "*", serviceCategory: "CARVING", sizeCategory: "*", price: 25.0 },
  { productType: "*", animalType: "*", serviceCategory: "CUTTING", sizeCategory: "*", price: 15.0 },
  { productType: "*", animalType: "*", serviceCategory: "PAINTING", sizeCategory: "*", price: 20.0 },
  { productType: "*", animalType: "*", serviceCategory: "SANDING", sizeCategory: "*", price: 18.0 },
  { productType: "*", animalType: "*", serviceCategory: "FINISHING", sizeCategory: "*", price: 22.0 },
  { productType: "*", animalType: "*", serviceCategory: "FINISHED", sizeCategory: "*", price: 35.0 },
];

// Function to look up price from mock database (will eventually be replaced by API call)
const getProductPrice = (productType: string, animalType: string, serviceCategory: string, sizeCategory: string) => {
  // Ideally, this entire lookup logic would be on your Django backend.
  // The frontend would call a price lookup API, e/g., /api/calculate-price/
  // and send productType, animalType, serviceCategory, sizeCategory as query params.

  const exactMatch = mockProductPrices.find(
    (p) =>
      p.productType === productType &&
      p.animalType === animalType &&
      p.serviceCategory === serviceCategory &&
      p.sizeCategory === sizeCategory,
  );

  if (exactMatch) return exactMatch.price;

  const sizeDefaultMatch = mockProductPrices.find(
    (p) =>
      p.productType === productType &&
      p.animalType === animalType &&
      p.serviceCategory === serviceCategory &&
      p.sizeCategory === "*",
  );

  if (sizeDefaultMatch) return sizeDefaultMatch.price;

  const animalDefaultMatch = mockProductPrices.find(
    (p) => p.productType === productType && p.animalType === "*" && p.serviceCategory === serviceCategory,
  );

  if (animalDefaultMatch) return animalDefaultMatch.price;

  const serviceDefaultMatch = mockProductPrices.find(
    (p) => p.productType === "*" && p.animalType === "*" && p.serviceCategory === serviceCategory,
  );

  return serviceDefaultMatch ? serviceDefaultMatch.price : 20.0; // Default fallback
};


interface JobItemDisplay extends JobItemPayload {
  id: string; // Client-side ID for list key
  artisanName: string; // For display purposes
}

export default function CreateJobPage() {
  const router = useRouter();
  const { data: artisans, loading: artisansLoading, error: artisansError } = useArtisans();
  const { createJob, loading: createJobLoading, error: createJobError, jobResponse } = useCreateJob();
  // const { data: productPricesData, loading: pricesLoading, error: pricesError } = useProductPrices(); // Uncomment and use if you have a price API

  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [jobItems, setJobItems] = useState<JobItemDisplay[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newJobId, setNewJobId] = useState<number | null>(null);

  const [currentItem, setCurrentItem] = useState({
    artisanId: 0,
    productType: "",
    animalType: "",
    sizeCategory: "MEDIUM",
    quantity: 1,
  });

  // Calculate statistics based on fetched artisans
  const safeArtisans = artisans || [];

  const addJobItem = () => {
    if (currentItem.artisanId && currentItem.productType && currentItem.animalType && serviceCategory) {
      const unitPrice = getProductPrice(
        currentItem.productType,
        currentItem.animalType,
        serviceCategory,
        currentItem.sizeCategory,
      );

      const totalPrice = unitPrice * currentItem.quantity;

      const selectedArtisan = safeArtisans.find((a) => a.id === currentItem.artisanId);

      if (!selectedArtisan) return; // Should not happen if select is correctly populated

      const newItem: JobItemDisplay = {
        id: Date.now().toString(), // Client-side unique ID
        artisan: currentItem.artisanId, // Backend expects 'artisan' ID
        artisanName: selectedArtisan.name, // For display
        product_type: currentItem.productType, // Backend expects snake_case
        animal_type: currentItem.animalType, // Backend expects snake_case
        size_category: currentItem.sizeCategory, // Backend expects snake_case
        quantity: currentItem.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };

      setJobItems([...jobItems, newItem]);
      setCurrentItem({
        artisanId: currentItem.artisanId, // Keep the same artisan for convenience
        productType: "",
        animalType: "",
        sizeCategory: "MEDIUM",
        quantity: 1,
      });
    }
  };

  const removeJobItem = (id: string) => {
    setJobItems(jobItems.filter((item) => item.id !== id));
  };

  const totalJobValue = jobItems.reduce((sum, item) => sum + item.total_price, 0); // Use item.total_price
  const totalItems = jobItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueArtisansCount = new Set(jobItems.map((item) => item.artisan)).size; // Use item.artisan for unique count

  const handleSubmit = async () => {
    if (jobItems.length === 0 || !serviceCategory) {
      alert("Please add at least one job item and select a service category.");
      return;
    }

    // Map jobItems to the payload format expected by the backend
    const jobItemsPayload: JobItemPayload[] = jobItems.map(item => ({
      artisan: item.artisan,
      product_type: item.product_type,
      animal_type: item.animal_type,
      size_category: item.size_category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const payload: CreateJobPayload = {
      service_category: serviceCategory,
      notes: notes || undefined, // Send notes only if not empty
      job_items: jobItemsPayload,
    };

    try {
      const createdJob = await createJob(payload); // Call the API hook
      if (createdJob) {
        setNewJobId(createdJob.id);
        setShowSuccessDialog(true);
        // Clear form after successful submission
        setJobItems([]);
        setServiceCategory("");
        setNotes("");
        setCurrentItem({
          artisanId: 0,
          productType: "",
          animalType: "",
          sizeCategory: "MEDIUM",
          quantity: 1,
        });
      }
    } catch (error) {
      // Error is already handled by useCreateJob hook and set to its error state
      // You can add a toast or more specific UI feedback here if needed
      console.error("Submission error caught in component:", error);
    }
  };

  const handleViewJob = () => {
    if (newJobId) {
      router.push(`/jobs/${newJobId}`);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessDialog(false);
  };

  // Render loading state for artisans and job creation
  if (artisansLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-80 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
          </div>
          <div><Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card></div>
        </div>
      </div>
    );
  }

  // Render error state for artisans loading
  if (artisansError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Artisans</AlertTitle>
          <AlertDescription>{artisansError}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">Reload Page</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Job</h1>
        <p className="text-muted-foreground mt-2">Assign work to artisans and calculate payments</p>
      </div>

      {createJobError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error Creating Job</AlertTitle>
          <AlertDescription>{createJobError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Setup */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Set up the basic job information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="serviceCategory">Service Category *</Label>
                <Select value={serviceCategory} onValueChange={setServiceCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the type of work being assigned (e.g., CARVING, PAINTING)
                </p>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for this job..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Job Items</CardTitle>
              <CardDescription>Assign specific products to artisans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artisan">Artisan *</Label>
                  <Select
                    value={currentItem.artisanId.toString()}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, artisanId: Number.parseInt(value) })}
                    disabled={artisansLoading || artisansError !== null} // Disable if artisans are loading or error
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select artisan" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeArtisans.map((artisan) => (
                        <SelectItem key={artisan.id} value={artisan.id.toString()}>
                          {artisan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productType">Product Type *</Label>
                  <Select
                    value={currentItem.productType}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, productType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="animalType">Animal Type *</Label>
                  <Select
                    value={currentItem.animalType}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, animalType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANIMAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sizeCategory">Size Category</Label>
                  <Select
                    value={currentItem.sizeCategory}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, sizeCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_CATEGORIES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addJobItem}
                    className="w-full"
                    disabled={
                      !currentItem.artisanId || !currentItem.productType || !currentItem.animalType || !serviceCategory
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {currentItem.productType && currentItem.animalType && serviceCategory && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span className="text-sm">
                      Estimated unit price:{" "}
                      <strong>
                        $
                        {getProductPrice( // Still using mock getProductPrice here
                          currentItem.productType,
                          currentItem.animalType,
                          serviceCategory,
                          currentItem.sizeCategory,
                        ).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Items List */}
          {jobItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Job Items ({jobItems.length})</CardTitle>
                <CardDescription>Items assigned to this job</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artisan</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.artisanName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.product_type.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>{item.animal_type}</TableCell>
                        <TableCell>{item.size_category.replace(/_/g, " ")}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${item.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeJobItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Job Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
              <CardDescription>Review before creating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Service Category</Label>
                <p className="text-sm text-muted-foreground">{serviceCategory || "Not selected"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Total Items</Label>
                <p className="text-sm text-muted-foreground">{totalItems} pieces</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Artisans Involved</Label>
                <p className="text-sm text-muted-foreground">{uniqueArtisansCount} artisans</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Total Job Value</Label>
                  <span className="text-lg font-bold">${totalJobValue.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={jobItems.length === 0 || !serviceCategory || createJobLoading}
              >
                {createJobLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Check className="h-6 w-6 text-green-500 mr-2" />
              Job Created Successfully
            </DialogTitle>
            <DialogDescription>
              Job #{newJobId} has been created with {jobItems.length} items.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Service Category:</span>
                <span className="font-medium">{serviceCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Items:</span>
                <span className="font-medium">{totalItems} pieces</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Value:</span>
                <span className="font-medium">${totalJobValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCreateAnother} className="sm:flex-1">
              Create Another Job
            </Button>
            <Button onClick={handleViewJob} className="sm:flex-1">
              View Job Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}