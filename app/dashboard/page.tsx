"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Package, BarChart3, TrendingUp } from "lucide-react";
import { KitBatchForm } from "@/components/forms";

export default function DashboardPage() {
  const [kitBatchFormOpen, setKitBatchFormOpen] = useState(false);

  const handleKitBatchSuccess = () => {
    // Refresh data or show success message
    console.log("Kit batch created successfully");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-h1 font-heading text-text-primary mb-2">Dashboard</h1>
          <p className="text-body text-text-secondary">
            Welcome to the Lab Sample Management System
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary mb-1">Total Samples</p>
                  <p className="text-h1 font-heading text-text-primary">1,234</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-small text-success">+12.5%</span>
                <span className="text-small text-text-secondary">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary mb-1">Kits in Stock</p>
                  <p className="text-h1 font-heading text-text-primary">456</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="success">In Stock</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary mb-1">Pending Tests</p>
                  <p className="text-h1 font-heading text-text-primary">89</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="warning">Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary mb-1">Completed Today</p>
                  <p className="text-h1 font-heading text-text-primary">23</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="success">Completed</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest sample processing updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sample T10_00042 completed</p>
                    <p className="text-small text-text-secondary">2 minutes ago</p>
                  </div>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">New kit batch received</p>
                    <p className="text-small text-text-secondary">15 minutes ago</p>
                  </div>
                </div>
                <Badge variant="default">New</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sample T10_00041 pending review</p>
                    <p className="text-small text-text-secondary">1 hour ago</p>
                  </div>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>Create New Sample</Button>
              <Button 
                variant="secondary"
                onClick={() => setKitBatchFormOpen(true)}
              >
                Add Kit Batch
              </Button>
              <Button variant="outline">View Reports</Button>
              <Button variant="outline">Export Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kit Batch Form */}
      <KitBatchForm
        open={kitBatchFormOpen}
        onOpenChange={setKitBatchFormOpen}
        onSuccess={handleKitBatchSuccess}
      />
    </AppShell>
  );
}
