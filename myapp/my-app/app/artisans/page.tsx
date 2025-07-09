"use client"; // This directive is crucial for using hooks like useState and useEffect

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Phone, Calendar, DollarSign, Briefcase, Star } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

// Import the useArtisans hook from your hooks file
import { useArtisans } from '@/hooks/useApi'; // Assuming your hooks file is named useApiHooks.ts/js

// Import the Artisan interface from your API types file
import { Artisan } from '@/lib/api'; // Assuming your types are exported from lib/api/index.ts

interface NewArtisan {
  name: string;
  phone: string;
  specialties: string[];
  notes: string;
}

export default function ArtisansPage() {
  // Use the useArtisans hook to fetch data
  // The 'data' returned by useArtisans will be Artisan[] | null
  const { data: artisans, loading, error, refetch } = useArtisans();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newArtisan, setNewArtisan] = useState<NewArtisan>({
    name: "",
    phone: "",
    specialties: [],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const availableSpecialties = ["CARVING", "CUTTING", "PAINTING", "SANDING", "FINISHING", "FINISHED"];

  // Calculate statistics based on fetched artisans
  // Ensure 'artisans' is treated as an array for calculations
  const safeArtisans = artisans || [];

  const activeArtisans = safeArtisans.filter((a: Artisan) => a.is_active).length;
  const totalEarnings = safeArtisans.reduce((sum, a) => sum + (a.total_earnings || 0), 0);
  const totalPendingPayments = safeArtisans.reduce((sum, a) => sum + (a.pending_payment || 0), 0);
  const averageRating = safeArtisans.length ?
    safeArtisans.reduce((sum, a) => sum + (a.average_rating || 0), 0) / safeArtisans.length : 0;

  function handleSpecialtyToggle(specialty: string) {
    setNewArtisan((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s: string) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  }

  async function handleAddArtisan() {
    setSubmitting(true);
    try {
      // Change the fetch URL to your Django backend's address
      const response = await fetch("http://127.0.0.1:8000/api/artisans/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArtisan),
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400 Bad Request, 500 Internal Server Error from Django)
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Failed to add artisan");
      }

      setShowAddDialog(false);
      setNewArtisan({ name: "", phone: "", specialties: [], notes: "" });
      refetch();
    } catch (err: any) {
      console.error("Failed to create artisan:", err);
      alert(`Error: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={refetch} className="mt-4">Retry</Button> {/* Add a retry button */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Artisan Management</h1>
            <p className="text-muted-foreground mt-2">Manage your skilled craftspeople and their performance</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Artisan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Artisan</DialogTitle>
                <DialogDescription>Enter the artisan's information below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newArtisan.name}
                    onChange={(e) => setNewArtisan({ ...newArtisan, name: e.target.value })}
                    placeholder="Artisan name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newArtisan.phone}
                    onChange={(e) => setNewArtisan({ ...newArtisan, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={newArtisan.specialties.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSpecialtyToggle(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Click to select/deselect specialties</p>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newArtisan.notes}
                    onChange={(e) => setNewArtisan({ ...newArtisan, notes: e.target.value })}
                    placeholder="Any additional notes about the artisan..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddArtisan} disabled={!newArtisan.name || submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Artisan
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Artisan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Artisans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeArtisans}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Artisans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Artisans</CardTitle>
          <CardDescription>Complete list of craftspeople</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Pending Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeArtisans.map((artisan: Artisan) => (
                <TableRow key={artisan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{artisan.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {/* Ensure created_date is a valid date string for formatting */}
                        Joined {new Date(artisan.created_date).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1" />
                      {artisan.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {/* Assuming specialties is an array of strings on the Artisan object */}
                      {(artisan.specialties || []).map((specialty: string) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {artisan.total_jobs || 0} jobs
                      </div>
                      <div className="text-muted-foreground flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                        {(artisan.average_rating || 0).toFixed(1)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">${(artisan.total_earnings || 0).toFixed(2)}</div>
                      <div className="text-muted-foreground">Total earned</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {(artisan.pending_payment || 0) > 0 ? (
                        <span className="text-orange-600">${(artisan.pending_payment || 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">$0.00</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={artisan.is_active ? "default" : "secondary"}>
                      {artisan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/artisans/${artisan.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/artisans/${artisan.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {(artisan.pending_payment || 0) > 0 && (
                        <Link href={`/payslips/generate?artisan_id=${artisan.id}`}>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        </Link>
                      )}
                    </div>
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