import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { BarracksDistributionDialog } from "@/components/BarracksDistributionDialog";
import { RoomDistributionList } from "@/components/RoomDistributionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BarracksStores() {
  const { role } = useAuth();
  const { applyUnitFilter, canSeeAllUnits, userUnitId } = useUnitFilter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [selectedItemForDistribution, setSelectedItemForDistribution] = useState<any>(null);

  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN' || role === 'CO';

  const fetchItems = async () => {
    let query = supabase.from("barracks_stores").select("*, unit:units(name)");
    query = applyUnitFilter(query, { columnName: 'unit_id' });
    const { data, error } = await query.order('item_name');
    
    if (error) {
      console.error('Error fetching barracks stores:', error);
    } else if (data) {
      setItems(data);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userUnitId, canSeeAllUnits]);

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.item_id?.toLowerCase().includes(searchLower) ||
      item.item_name?.toLowerCase().includes(searchLower) ||
      item.item_type?.toLowerCase().includes(searchLower) ||
      item.unit?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Barracks Stores (TTR Form 57)
            </h1>
            <p className="text-muted-foreground mt-1">
              Accommodation stores inventory - beds, chairs, tables, desks, etc.
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {role === 'S4' && <BulkUploadDialog module="barracks_stores" moduleName="Barracks Stores" />}
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={() => {
                  setSelectedItemForDistribution(null);
                  setDistributionDialogOpen(true);
                }}
              >
                <Package className="h-4 w-4" />
                Distribute to Room
              </Button>
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Store Item
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="distributions">Room Distributions</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Barracks Stores Inventory</span>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search stores..." 
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
                {searchTerm ? "No items match your search." : "No barracks stores data available. Add items to get started."}
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
                        <span className="font-tactical uppercase text-muted-foreground">Type</span>
                        <span className="font-medium">{item.item_type}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Total</span>
                        <Badge variant="outline">{item.quantity_total || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Available</span>
                        <Badge variant="default">{item.quantity_available || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Issued</span>
                        <Badge variant="secondary">{item.quantity_issued || 0}</Badge>
                      </div>
                      {item.unit?.name && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Unit</span>
                          <span className="font-medium text-xs">{item.unit.name}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <StatusBadge 
                          status={item.condition || 'serviceable'}
                          type="serviceability"
                          className="w-full justify-center"
                        />
                      </div>
                      {canManage && item.quantity_available > 0 && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemForDistribution(item);
                              setDistributionDialogOpen(true);
                            }}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Distribute
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="distributions">
            <RoomDistributionList />
          </TabsContent>
        </Tabs>

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.item_id} - ${selectedItem.item_name}` : ''}
          data={selectedItem}
        />

        <BarracksDistributionDialog
          open={distributionDialogOpen}
          onOpenChange={setDistributionDialogOpen}
          onSuccess={() => {
            fetchItems();
          }}
          barracksStoreItem={selectedItemForDistribution}
        />
      </main>
    </div>
  );
}

