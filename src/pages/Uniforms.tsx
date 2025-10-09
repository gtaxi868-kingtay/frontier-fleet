import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Uniforms() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Uniforms Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Uniform issuance, return, and condition tracking
            </p>
          </div>
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Uniform
          </Button>
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Uniform Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search uniforms..." className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No uniforms data available. Connect to backend to load inventory.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
