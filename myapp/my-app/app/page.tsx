import LiveDashboard from "@/components/live-dashboard";
import LiveJobs from "@/components/live-jobs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Briefcase, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artisan Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your woodcraft production workflow</p>
        </div>

        <LiveDashboard />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/jobs/create">
                <Button className="w-full justify-start" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create New Job
                </Button>
              </Link>
              <Link href="/jobs/complete">
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Job
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Pricing
                </Button>
              </Link>
              <Link href="/inventory">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  View Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Removed Recent Activity Card */}
        </div>

        {/* Current Jobs Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Jobs</CardTitle>
            <CardDescription>Overview of active production jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveJobs />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}