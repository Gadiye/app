"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import API hooks and types
import {
  useArtisans,
  useCreateJob,
  useProductPrice, // <-- IMPORT THE NEW HOOK
  Artisan,
  JobItemPayload,
  CreateJobPayload,
} from '@/hooks/useApi';

// --- CONSTANTS (Keep as is) ---
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

// --- REMOVE MOCK PRODUCT PRICING AND getProductPrice FUNCTION ---
// These will be replaced by the API call

interface JobItemDisplay extends JobItemPayload {
  id: string; // Client-side ID for list key
  artisanName: string; // For display purposes
}

export default function CreateJobPage() {
  const router = useRouter();
  const { data: artisans, loading: artisansLoading, error: artisansError } = useArtisans();
  const { createJob, loading: createJobLoading, error: createJobError, jobResponse } = useCreateJob();

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

  // --- NEW: Use useProductPrice hook ---
  const {
    data: priceData,
    loading: priceLoading,
    error: priceError,
  } = useProductPrice(
    currentItem.productType,
    currentItem.animalType,
    serviceCategory, // Use the main serviceCategory state
    currentItem.sizeCategory,
    { enabled: !!currentItem.productType && !!currentItem.animalType && !!serviceCategory } // Only enable if all selected
  );

  const estimatedUnitPrice = priceData?.price ?? 0; // Use the fetched price, default to 0 if not available

  // Calculate statistics based on fetched artisans
  const safeArtisans = artisans || [];

  const addJobItem = () => {
    // Ensure all required fields are present and we have an estimated price
    if (currentItem.artisanId && currentItem.productType && currentItem.animalType && serviceCategory && estimatedUnitPrice > 0) {
      const totalPrice = estimatedUnitPrice * currentItem.quantity;

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
        unit_price: estimatedUnitPrice, // Use the fetched price
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
    } else {
      // Optional: Add a more specific user feedback if item cannot be added
      alert("Please ensure all item details are selected and a valid price can be determined.");
    }
  };

  const removeJobItem = (id: string) => {
    setJobItems(jobItems.filter((item) => item.id !== id));
  };

  const totalJobValue = jobItems.reduce((sum, item) => sum + item.total_price, 0);
  const totalItems = jobItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueArtisansCount = new Set(jobItems.map((item) => item.artisan)).size;

  const handleSubmit = async () => {
    if (jobItems.length === 0 || !serviceCategory) {
      alert("Please add at least one job item and select a service category.");
      return;
    }

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
      notes: notes || undefined,
      job_items: jobItemsPayload,
    };

    try {
      const createdJob = await createJob(payload);
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
                    disabled={artisansLoading || artisansError !== null}
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
                      !currentItem.artisanId ||
                      !currentItem.productType ||
                      !currentItem.animalType ||
                      !serviceCategory ||
                      priceLoading || // Disable if price is still loading
                      estimatedUnitPrice === 0 // Disable if price is zero (meaning not found or error)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Display estimated price and loading/error states for price */}
              {(currentItem.productType && currentItem.animalType && serviceCategory) && (
                <div className="p-3 bg-muted rounded-lg">
                  {priceLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Calculating price...</span>
                    </div>
                  ) : priceError ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTitle>Error loading price: {priceError}</AlertTitle>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="text-sm">
                        Estimated unit price:{" "}
                        <strong>${estimatedUnitPrice.toFixed(2)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Items List (No changes here, it uses the data already in jobItems state) */}
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

        {/* Job Summary (No significant changes here, still uses derived state) */}
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

      {/* Success Dialog (No changes needed) */}
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