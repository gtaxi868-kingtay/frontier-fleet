import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddUniformDialog } from "@/components/AddUniformDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatIssuedTo, getItemStatus } from "@/lib/statusUtils";
import { QuickIssueDialog } from "@/components/QuickIssueDialog";
import { QuickReturnDialog } from "@/components/QuickReturnDialog";
import { Package, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useInventoryData } from "@/hooks/useInventoryData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Uniforms() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [quantityFilter, setQuantityFilter] = useState<string>('all');
  
  const { data: uniforms = [], refetch, update } = useInventoryData('uniforms');

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
            <CardTitle className="flex items-center justify-between mb-4">
              <span>Uniform Inventory</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search uniforms..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Headwear">Headwear</SelectItem>
                  <SelectItem value="Tops">Tops</SelectItem>
                  <SelectItem value="Bottoms">Bottoms</SelectItem>
                  <SelectItem value="Footwear">Footwear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Complete Sets">Complete Sets</SelectItem>
                </SelectContent>
              </Select>
              <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Quantities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quantities</SelectItem>
                  <SelectItem value="in_stock">In Stock (qty &gt; 0)</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock (qty = 0)</SelectItem>
                  <SelectItem value="low_stock">Low Stock (qty &lt; 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const filteredUniforms = uniforms.filter((item: any) => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = (
                  item.uniform_id?.toLowerCase().includes(searchLower) ||
                  item.item_name?.toLowerCase().includes(searchLower) ||
                  item.size?.toLowerCase().includes(searchLower) ||
                  item.category?.toLowerCase().includes(searchLower)
                );
                
                const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
                
                const qtyOnHand = item.qty_on_hand ?? 0;
                let matchesQuantity = true;
                if (quantityFilter === 'in_stock') {
                  matchesQuantity = qtyOnHand > 0;
                } else if (quantityFilter === 'out_of_stock') {
                  matchesQuantity = qtyOnHand === 0;
                } else if (quantityFilter === 'low_stock') {
                  matchesQuantity = qtyOnHand > 0 && qtyOnHand < 5;
                }
                
                return matchesSearch && matchesCategory && matchesQuantity;
              });

              return filteredUniforms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchTerm ? "No uniforms match your search." : "No uniforms data available. Add items to get started."}
                </p>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUniforms.map((item: any) => (
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
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium flex-1">{item.item_name}</p>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      {item.size && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Size</span>
                          <span className="font-medium">{item.size}</span>
                        </div>
                      )}
                      {/* Quantity Information */}
                      {(item.qty_on_hand !== null && item.qty_on_hand !== undefined) && (
                        <div className="space-y-1 pt-2 border-t">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                            <span className={`font-medium ${(item.qty_on_hand ?? 0) === 0 ? 'text-destructive' : (item.qty_on_hand ?? 0) < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                              {item.qty_on_hand ?? 0}
                            </span>
                          </div>
                          {(item.qty_issued !== null && item.qty_issued !== undefined && item.qty_issued > 0) && (
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Issued</span>
                              <span>{item.qty_issued}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="pt-2 space-y-2">
                        {/* Status Badge */}
                        <div className="flex items-center justify-center">
                          <StatusBadge 
                            status={item.issued_to ? 'issued' : (item.serviceable ? 'serviceable' : 'unserviceable')}
                            type={item.issued_to ? 'availability' : 'serviceability'}
                            className="w-full justify-center"
                          />
                        </div>

                        {/* Issued Status */}
                        {item.issued_to && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            Issued to: {formatIssuedTo(item.issued_to_profile)}
                          </div>
                        )}

                        {/* Quick Action Buttons */}
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

                        {/* Serviceability Toggle */}
                        {canManage && !item.issued_to && (
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
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              );
            })()}
          </CardContent>
        </Card>

        <AddUniformDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refetch}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.uniform_id} - ${selectedItem.item_name}` : ''}
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

        {/* Quick Issue Dialog */}
        <QuickIssueDialog
          open={issueDialogOpen}
          onOpenChange={(open) => {
            setIssueDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="uniforms"
          onSuccess={() => {
            refetch();
            setIssueDialogOpen(false);
            setSelectedItemForAction(null);
          }}
        />

        {/* Quick Return Dialog */}
        <QuickReturnDialog
          open={returnDialogOpen}
          onOpenChange={(open) => {
            setReturnDialogOpen(open);
            if (!open) setSelectedItemForAction(null);
          }}
          item={selectedItemForAction}
          module="uniforms"
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
