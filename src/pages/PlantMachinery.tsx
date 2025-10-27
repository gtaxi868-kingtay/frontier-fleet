import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddPlantMachineryDialog } from "@/components/AddPlantMachineryDialog";
import { useAuth } from "@/hooks/useAuth";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";

export default function PlantMachinery() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS';
  const [machinery, setMachinery] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchMachinery = async () => {
    const { data } = await supabase.from("plant_machinery").select("*");
    if (data) setMachinery(data);
  };

  useEffect(() => {
    fetchMachinery();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Plant & Machinery
            </h1>
            <p className="text-muted-foreground mt-1">
              Vehicles, heavy plant, and fuel consumption tracking
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {role === 'S4' && <BulkUploadDialog module="plant_machinery" moduleName="Plant & Machinery" />}
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Plant/Machinery
              </Button>
            </div>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fleet Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search vehicles..." className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {machinery.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No plant/machinery data available. Add items to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machinery.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {item.plant_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{item.type}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Make</span>
                        <span className="font-medium text-xs">{item.make_model}</span>
                      </div>
                      {item.location && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Location</span>
                          <span className="font-medium">{item.location}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Badge variant={item.serviceability === 'Serviceable' ? 'default' : 'destructive'} className="w-full justify-center">
                          {item.serviceability || 'Unknown'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddPlantMachineryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchMachinery}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.plant_id} - ${selectedItem.type}` : ''}
          data={selectedItem}
        />
      </main>
    </div>
  );
}
