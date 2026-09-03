import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Package, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddEngineerEquipmentDialog } from "@/components/AddEngineerEquipmentDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useAuth } from "@/hooks/useAuth";
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
import { QuickIssueDialog } from "@/components/QuickIssueDialog";
import { QuickReturnDialog } from "@/components/QuickReturnDialog";

export default function EngineerEquipment() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN' || role === 'STOREMAN';
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; updates: any } | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null);

  const { data: equipment = [], refetch, update } = useInventoryData('engineer_equipment');

  const handleStatusChange = (item: any, newServiceable: boolean) => {
    setPendingUpdate({
      id: item.id,
      updates: { serviceable: newServiceable }
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
              Engineer Equipment
            </h1>
            <p className="text-muted-foreground mt-1">
              Heavy construction and bridging equipment management
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {(role === 'S4' || role === 'S4_ADMIN') && <BulkUploadDialog module="engineer_equipment" moduleName="Engineer Equipment" />}
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Equipment
              </Button>
            </div>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Equipment Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search equipment..." className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No equipment data available. Add equipment to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((item) => (
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
                        {item.equip_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{item.equipment_name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Type</span>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                        <span className="font-medium">{item.qty_on_hand}</span>
                      </div>
                      <div className="pt-2">
                        {canManage ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Badge 
                                variant={item.serviceable ? 'default' : 'destructive'} 
                                className="w-full justify-center cursor-pointer hover:opacity-80"
                              >
                                {item.serviceable ? 'Serviceable' : 'Unserviceable'}
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="bg-background">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item, true);
                                }}
                                disabled={item.serviceable}
                              >
                                Mark as Serviceable
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item, false);
                                }}
                                disabled={!item.serviceable}
                              >
                                Mark as Unserviceable
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant={item.serviceable ? 'default' : 'destructive'} className="w-full justify-center">
                            {item.serviceable ? 'Serviceable' : 'Unserviceable'}
                          </Badge>
                        )}
                      </div>
                      {!item.issued_to && item.serviceable && canManage && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForAction(item);
                            setIssueDialogOpen(true);
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Issue Item
                        </Button>
                      )}
                      {item.issued_to && canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForAction(item);
                            setReturnDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Return Item
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddEngineerEquipmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refetch}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.equip_id} - ${selectedItem.equipment_name}` : ''}
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

        <QuickIssueDialog
          open={issueDialogOpen}
          onOpenChange={(open) => {
            setIssueDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="engineer_equipment"
          onSuccess={() => {
            refetch();
            setIssueDialogOpen(false);
            setSelectedItemForAction(null);
          }}
        />

        <QuickReturnDialog
          open={returnDialogOpen}
          onOpenChange={(open) => {
            setReturnDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="engineer_equipment"
          onSuccess={() => {
            refetch();
            setReturnDialogOpen(false);
            setSelectedItemForAction(null);
          }}
        />
      </main>
    </div>
  );
}
