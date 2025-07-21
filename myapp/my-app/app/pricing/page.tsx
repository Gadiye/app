"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useServiceRates } from '@/hooks/useResource'

export default function PricingPage() {
  const { data: serviceRates, loading, error } = useServiceRates();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Service Rates</h1>
        <p className="text-muted-foreground mt-2">Fixed rates for artisan services per product type</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Service Rates</CardTitle>
          <CardDescription>Rates paid to artisans for each unit of work completed</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Service Category</TableHead>
                <TableHead>Rate Per Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRates && serviceRates.length > 0 ? (
                serviceRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.product?.product_type} - {rate.product?.animal_type}</TableCell>
                    <TableCell>{rate.service_category}</TableCell>
                    <TableCell>Ksh{(rate.rate_per_unit ?? 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No service rates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
