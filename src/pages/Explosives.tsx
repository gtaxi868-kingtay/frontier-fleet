import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, ShieldAlert, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddExplosiveDialog } from "@/components/AddExplosiveDialog";
import { useAuth } from "@/hooks/useAuth";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SensitiveGate } from "@/components/SensitiveGate";
import { useSensitiveUnlock } from "@/hooks/useSensitiveUnlock";

interface ExplosivesChangeRequest {
  id: string;
  action_type: string;
  changes: any;
  justification: string | null;
  requested_by: string;
  created_at: string;
}

export default function Explosives() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role, profile } = useAuth();
  const { applyUnitFilter, currentUnitId, canSeeAllUnits } = useUnitFilter();
  const canManage = role === 'S4';
  const isCO = role === 'CO';
  const [explosives, setExplosives] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ExplosivesChangeRequest[]>([]);
  const { unlocked } = useSensitiveUnlock();

  const fetchExplosives = async () => {
    let query = supabase.from("explosives").select("*");
    query = applyUnitFilter(query, { columnName: 'squadron_id' });
    const { data } = await query;
    if (data) setExplosives(data);
  };

  const fetchPendingRequests = async () => {
    if (!isCO) return;
    const { data } = await supabase
      .from("explosives_change_requests")
      .select("*")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    setPendingRequests((data as ExplosivesChangeRequest[]) || []);
  };

  useEffect(() => {
    // Don't fetch ammunition data at all until the session is actually
    // unlocked — the SensitiveGate hiding the rendered Card was cosmetic
    // otherwise, since the data would already be sitting in React state
    // (and the network response) regardless of what's on screen.
    if (!unlocked) {
      setExplosives([]);
      setPendingRequests([]);
      return;
    }
    fetchExplosives();
    fetchPendingRequests();
  }, [currentUnitId, canSeeAllUnits, unlocked]);

  const handleResolve = async (id: string, approve: boolean) => {
    const { data, error } = await supabase.rpc("resolve_explosives_change", {
      p_request_id: id,
      p_approve: approve,
      p_notes: null,
    });
    if (error || !(data as any)?.success) {
      toast.error((data as any)?.error || error?.message || "Failed to resolve request");
      return;
    }
    toast.success(approve ? "Approved and applied" : "Rejected");
    fetchPendingRequests();
    fetchExplosives();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Explosives Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Strictly controlled demolition and ammunition stores
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {(role === 'S4' || role === 'S4_ADMIN') && <BulkUploadDialog module="explosives" moduleName="Explosives" />}
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Request Add (CO approval required)
              </Button>
            </div>
          )}
        </div>

        <SensitiveGate
          context="explosives"
          title="Ammunition Data Locked"
          description="This screen shows types, lot numbers, and quantities — including pending approval requests. Confirm your password or PIN to view it."
        >
          {isCO && pendingRequests.length > 0 && (
            <Card className="border-destructive/40 bg-destructive/5 mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" /> Pending Explosives Approvals ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {req.action_type} — {req.changes?.explosive_id || req.changes?.type || "explosives item"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty received: {req.changes?.quantity_received ?? "—"} · Lot: {req.changes?.lot_number || "—"}
                      </p>
                      {req.justification && <p className="text-xs text-muted-foreground mt-1">"{req.justification}"</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleResolve(req.id, true)}>
                        <Check className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleResolve(req.id, false)}>
                        <X className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Explosives Inventory</span>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search explosives..." className="pl-9" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {explosives.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No explosives data available. Add items to get started.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {explosives.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-destructive/50"
                      onClick={() => {
                        setSelectedItem(item);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-display uppercase tracking-wider">
                          {item.explosive_id}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{item.type}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Lot#</span>
                          <span className="font-medium">{item.lot_number}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-tactical uppercase text-muted-foreground">Received</span>
                          <span className="font-medium">{item.quantity_received}</span>
                        </div>
                        <div className="pt-2">
                          <Badge variant="destructive" className="w-full justify-center">
                            CONTROLLED ITEM
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </SensitiveGate>

        <AddExplosiveDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchExplosives}
        />

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `${selectedItem.explosive_id} - ${selectedItem.type}` : ''}
          data={selectedItem}
        />
      </main>
    </div>
  );
}
