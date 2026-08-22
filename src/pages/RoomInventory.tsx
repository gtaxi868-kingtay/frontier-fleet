import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { AddRoomInventoryDialog } from "@/components/AddRoomInventoryDialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function RoomInventory() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'OC' || role === 'SQMS';

  const fetchRooms = async () => {
    const { data } = await supabase.from("room_inventory").select("*");
    if (data) setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      room.room_id?.toLowerCase().includes(term) ||
      room.room_type?.toLowerCase().includes(term) ||
      room.platoon_company?.toLowerCase().includes(term) ||
      room.inventory_item?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Room Inventory (Annex E)
            </h1>
            <p className="text-muted-foreground mt-1">
              Accommodation and office fixtures tracking
            </p>
          </div>
          {canManage && (
            <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Room Item
            </Button>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Room Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No room inventory data available. {canManage && "Add items to get started."}
              </p>
            ) : filteredRooms.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No rooms match "{search}".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room) => (
                  <Card 
                    key={room.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50"
                    onClick={() => {
                      setSelectedItem(room);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {room.room_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{room.room_type}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Unit</span>
                        <span className="font-medium text-xs">{room.platoon_company}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Item</span>
                        <span className="font-medium">{room.inventory_item}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Expected</span>
                        <Badge variant="outline">{room.expected_qty}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Present</span>
                        <Badge variant={room.present_qty >= room.expected_qty ? 'default' : 'destructive'}>
                          {room.present_qty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.room_id} - ${selectedItem.room_type}` : ''}
          data={selectedItem}
        />

        <AddRoomInventoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchRooms}
        />
      </main>
    </div>
  );
}
