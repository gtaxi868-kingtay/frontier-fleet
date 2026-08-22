import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, Plus, Trash2, Boxes } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  "weapons", "tools", "engineer_equipment", "plant_machinery", "explosives",
  "uniforms", "ppe", "facilities", "general_inventory", "works_materials",
];

interface KitItem {
  id: string;
  category: string;
  item_name: string;
  quantity: number;
}

interface Kit {
  id: string;
  kit_name: string;
  description: string | null;
  unit_id: string | null;
  units?: { name: string } | null;
  equipment_kit_items: KitItem[];
}

export default function EquipmentKits() {
  const { role, profile } = useAuth();
  const canManage = ["S4", "S4_ADMIN", "CO"].includes(role || "");

  const [kits, setKits] = useState<Kit[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [kitName, setKitName] = useState("");
  const [kitDesc, setKitDesc] = useState("");
  const [kitUnitId, setKitUnitId] = useState("");
  const [items, setItems] = useState<{ category: string; item_name: string; quantity: string }[]>([
    { category: "weapons", item_name: "", quantity: "1" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: kitData }, { data: unitData }] = await Promise.all([
      supabase.from("equipment_kits").select("*, units(name), equipment_kit_items(*)").order("kit_name"),
      supabase.from("units").select("id, name").order("name"),
    ]);
    setKits((kitData as unknown as Kit[]) || []);
    setUnits(unitData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addItemRow = () => setItems([...items, { category: "weapons", item_name: "", quantity: "1" }]);
  const removeItemRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItemRow = (idx: number, patch: Partial<{ category: string; item_name: string; quantity: string }>) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const resetForm = () => {
    setKitName("");
    setKitDesc("");
    setKitUnitId(profile?.unit_id || "");
    setItems([{ category: "weapons", item_name: "", quantity: "1" }]);
  };

  const submitKit = async () => {
    const validItems = items.filter((it) => it.item_name.trim() && parseInt(it.quantity) > 0);
    if (!kitName.trim() || validItems.length === 0) {
      toast.error("Kit name and at least one item are required");
      return;
    }
    setSubmitting(true);
    const { data: kit, error } = await supabase
      .from("equipment_kits")
      .insert({ kit_name: kitName.trim(), description: kitDesc.trim() || null, unit_id: kitUnitId || null })
      .select()
      .single();

    if (error || !kit) {
      toast.error(error?.message || "Failed to create kit");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("equipment_kit_items").insert(
      validItems.map((it) => ({
        kit_id: kit.id,
        category: it.category,
        item_name: it.item_name.trim(),
        quantity: parseInt(it.quantity),
      }))
    );

    setSubmitting(false);
    if (itemsError) {
      toast.error(itemsError.message);
      return;
    }

    toast.success("Kit created");
    setCreateOpen(false);
    resetForm();
    load();
  };

  const deleteKit = async (id: string) => {
    const { error } = await supabase.from("equipment_kits").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kit deleted");
    load();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Equipment Kits</h1>
              <p className="text-muted-foreground">Bundled item sets (e.g. Standard Field Kit) for faster issue</p>
            </div>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> New Kit
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : kits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No kits defined yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {kits.map((kit) => (
              <Card key={kit.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" /> {kit.kit_name}
                      </CardTitle>
                      {kit.description && <p className="text-sm text-muted-foreground mt-1">{kit.description}</p>}
                      {kit.units?.name && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {kit.units.name}
                        </Badge>
                      )}
                    </div>
                    {canManage && (
                      <Button size="icon" variant="ghost" onClick={() => deleteKit(kit.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {kit.equipment_kit_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0">
                      <span>{item.item_name}</span>
                      <span className="text-muted-foreground">
                        {item.category.replace(/_/g, " ")} · x{item.quantity}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Equipment Kit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label>Kit Name</Label>
              <Input value={kitName} onChange={(e) => setKitName(e.target.value)} placeholder="e.g., Standard Field Kit" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={kitDesc} onChange={(e) => setKitDesc(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={kitUnitId} onValueChange={setKitUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items</Label>
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center p-2 rounded-lg border border-border/30 sm:border-0 sm:p-0">
                  <Input
                    value={item.item_name}
                    onChange={(e) => updateItemRow(idx, { item_name: e.target.value })}
                    placeholder="Item name"
                    className="flex-1 min-w-[140px] order-1"
                  />
                  <Select value={item.category} onValueChange={(v) => updateItemRow(idx, { category: v })}>
                    <SelectTrigger className="w-36 shrink-0 order-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItemRow(idx, { quantity: e.target.value })}
                    className="w-16 shrink-0 order-3"
                  />
                  <Button size="icon" variant="ghost" className="shrink-0 order-4" onClick={() => removeItemRow(idx)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addItemRow}>
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitKit} disabled={submitting}>
              Create Kit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
