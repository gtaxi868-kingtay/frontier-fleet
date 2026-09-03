import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, UserPlus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddPlantMachineryDialog } from "@/components/AddPlantMachineryDialog";
import { useAuth } from "@/hooks/useAuth";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useInventoryData } from "@/hooks/useInventoryData";
import { AssignOperatorDialog } from "@/components/AssignOperatorDialog";
import { UnassignOperatorDialog } from "@/components/UnassignOperatorDialog";
import { useQuery } from "@tanstack/react-query";

export default function PlantMachinery() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN' || role === 'STOREMAN';
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; updates: any } | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null);

  const { data: machinery = [], refetch, update } = useInventoryData('plant_machinery');

  const operatorIds = Array.from(
    new Set(machinery.map((m: any) => m.operator_assigned).filter(Boolean))
  ) as string[];

  const { data: operatorProfiles = [] } = useQuery({
    queryKey: ['plant-machinery-operators', operatorIds],
    queryFn: async () => {
      if (operatorIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank')
        .in('id', operatorIds);
      if (error) throw error;
      return data || [];
    },
    enabled: operatorIds.length > 0,
  });

  const operatorById = Object.fromEntries(operatorProfiles.map((p: any) => [p.id, p]));

  const handleStatusChange = (item: any, newServiceability: string) => {
    setPendingUpdate({
      id: item.id,
      updates: { serviceability: newServiceability }
    });
    setConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
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
              {(role === 'S4' || role === 'S4_ADMIN') && <BulkUploadDialog module="plant_machinery" moduleName="Plant & Machinery" />}
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
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Operator</span>
                        <span className="font-medium">
                          {item.operator_assigned
                            ? operatorById[item.operator_assigned]
                              ? `${operatorById[item.operator_assigned].rank || ''} ${operatorById[item.operator_assigned].name}`.trim()
                              : 'Loading…'
                            : 'Unassigned'}
                        </span>
                      </div>
                      <div className="pt-2">
                        {canManage ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Badge 
                                variant={item.serviceability === 'Serviceable' ? 'default' : 'destructive'} 
                                className="w-full justify-center cursor-pointer hover:opacity-80"
                              >
                                {item.serviceability || 'Unknown'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="bg-background">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item, 'Serviceable');
                                }}
                                disabled={item.serviceability === 'Serviceable'}
                              >
                                Mark as Serviceable
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item, 'Unserviceable');
                                }}
                                disabled={item.serviceability === 'Unserviceable'}
                              >
                                Mark as Unserviceable
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant={item.serviceability === 'Serviceable' ? 'default' : 'destructive'} className="w-full justify-center">
                            {item.serviceability || 'Unknown'}
                          </Badge>
                        )}
                      </div>
                      {!item.operator_assigned && canManage && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForAction(item);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Operator
                        </Button>
                      )}
                      {item.operator_assigned && canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForAction(item);
                            setUnassignDialogOpen(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unassign Operator
                        </Button>
                      )}
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
          onSuccess={refetch}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.plant_id} - ${selectedItem.type}` : ''}
          data={selectedItem}
        />
        
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => {
            if (pendingUpdate) {
              update(pendingUpdate);
              setPendingUpdate(null);
            }
            setConfirmOpen(false);
          }}
          title="Confirm Status Update"
          description="Are you sure you want to update this item's status? This action will be logged in the audit trail."
        />

        <AssignOperatorDialog
          open={assignDialogOpen}
          onOpenChange={(open) => {
            setAssignDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="plant_machinery"
          onSuccess={() => {
            refetch();
            setAssignDialogOpen(false);
            setSelectedItemForAction(null);
          }}
        />

        <UnassignOperatorDialog
          open={unassignDialogOpen}
          onOpenChange={(open) => {
            setUnassignDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="plant_machinery"
          onSuccess={() => {
            refetch();
            setUnassignDialogOpen(false);
            setSelectedItemForAction(null);
          }}
        />
      </main>
    </div>
  );
}
