import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AddPPEDialog } from "@/components/AddPPEDialog";
import { useAuth } from "@/hooks/useAuth";

export default function PPE() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Personal Protective Equipment
            </h1>
            <p className="text-muted-foreground mt-1">
              PPE distribution and condition tracking
            </p>
          </div>
          {canManage && (
            <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add PPE Item
            </Button>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>PPE Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search PPE..." className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No PPE data available. Add items to get started.
            </p>
          </CardContent>
        </Card>

        <AddPPEDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {}}
        />
      </main>
    </div>
  );
}
