import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddGeneralInventoryDialog } from "@/components/AddGeneralInventoryDialog";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export default function Inventory() {
  const { role } = useAuth();
  const { applyUnitFilter, canSeeAllUnits, userUnitId, currentUnitId } = useUnitFilter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const canManage = role === 'S4' || role === 'SQMS';

  const fetchItems = async () => {
    let query = supabase.from("general_inventory").select("*");
    query = applyUnitFilter(query, { columnName: 'squadron_id' });
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching inventory:', error);
    } else if (data) {
      setItems(data);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userUnitId, canSeeAllUnits, currentUnitId]);

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.item_id?.toLowerCase().includes(searchLower) ||
      item.item_name?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    );
  });

  const lowStockItems = filteredItems.filter(item => 
    item.reorder_level > 0 && item.qty_on_hand <= item.reorder_level
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              General Inventory
            </h1>
            <p className="text-muted-foreground mt-1">
              Daily expendables, consumables, and stores management
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <BulkUploadDialog module="general_inventory" moduleName="General Inventory" />
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          )}
        </div>

        {lowStockItems.length > 0 && (
          <Card className="border-warning/50 bg-warning/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-warning flex items-center gap-2">
                <Search className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {lowStockItems.length} item(s) below reorder level need restocking
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>General Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search items..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm ? "No items match your search." : "No inventory data available. Add items to get started."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
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
                        {item.item_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{item.item_name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Category</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                        <span className="font-medium">{item.qty_on_hand}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Reorder Level</span>
                        <span className="font-medium">{item.reorder_level}</span>
                      </div>
                      {item.reorder_level > 0 && item.qty_on_hand <= item.reorder_level && (
                        <div className="pt-2">
                          <Badge variant="destructive" className="w-full justify-center">
                            LOW STOCK
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddGeneralInventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchItems}
      />

      {selectedItem && (
        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          data={selectedItem}
          title={`${selectedItem.item_id} - ${selectedItem.item_name}`}
        />
      )}
    </div>
  );
}
