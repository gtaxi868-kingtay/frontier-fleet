import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddUniformDialog } from "@/components/AddUniformDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";

export default function Uniforms() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS';
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchUniforms = async () => {
    const { data } = await supabase.from("uniforms").select("*");
    if (data) setUniforms(data);
  };

  useEffect(() => {
    fetchUniforms();
  }, []);

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
          {canManage && (
            <div className="flex gap-2">
              {role === 'S4' && <BulkUploadDialog module="uniforms" moduleName="Uniforms" />}
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Uniform
              </Button>
            </div>
          )}
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
            {uniforms.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No uniforms data available. Add items to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniforms.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-secondary/50"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {item.uniform_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{item.item_name}</p>
                      {item.size && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Size</span>
                          <span className="font-medium">{item.size}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Badge variant={item.serviceable ? 'default' : 'destructive'} className="w-full justify-center">
                          {item.serviceable ? 'Serviceable' : 'Unserviceable'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddUniformDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchUniforms}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.uniform_id} - ${selectedItem.item_name}` : ''}
          data={selectedItem}
        />
      </main>
    </div>
  );
}
