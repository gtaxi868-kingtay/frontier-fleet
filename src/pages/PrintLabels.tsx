import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Tags } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  type InventoryModule,
  encodeQRData,
  getIdField,
  getNameField,
  getModuleDisplayName,
} from "@/lib/qr-utils";

const MODULES: InventoryModule[] = [
  "weapons",
  "tools",
  "vehicles",
  "engineer_equipment",
  "plant_machinery",
  "mechanics_tools",
  "mt_facilities",
  "ppe",
  "uniforms",
  "explosives",
  "facilities",
  "works_materials",
  "general_inventory",
  "room_inventory",
];

interface Row {
  id: string;
  name: string;
}

export default function PrintLabels() {
  const [module, setModule] = useState<InventoryModule>("general_inventory");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const idField = getIdField(module);
    const nameField = getNameField(module);
    setLoading(true);
    setSelected(new Set());
    supabase
      .from(module as any)
      .select(`${idField}, ${nameField}`)
      .order(idField as any)
      .then(({ data, error }) => {
        if (error) {
          toast.error(`Failed to load ${getModuleDisplayName(module)}`);
          setRows([]);
        } else {
          setRows(
            (data || []).map((r: any) => ({ id: r[idField], name: r[nameField] })).filter((r) => r.id)
          );
        }
        setLoading(false);
      });
  }, [module]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  };

  const selectedRows = rows.filter((r) => selected.has(r.id));

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6 print:p-0">
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Tags className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Print QR Labels</h1>
              <p className="text-muted-foreground">Pick items, print a sheet of QR labels to stick on them</p>
            </div>
          </div>
          <Button onClick={() => window.print()} disabled={selectedRows.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print {selectedRows.length > 0 && `(${selectedRows.length})`}
          </Button>
        </div>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base">Select Items</CardTitle>
            <CardDescription>Choose a category, then check the items you want labels for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={module} onValueChange={(v) => setModule(v as InventoryModule)}>
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {getModuleDisplayName(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in {getModuleDisplayName(module)} yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selected.size === rows.length && rows.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm font-medium">
                    Select all ({rows.length})
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {rows.map((row) => (
                    <label
                      key={row.id}
                      className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 cursor-pointer min-w-0"
                    >
                      <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)} />
                      <span className="text-sm truncate">
                        <span className="font-medium">{row.id}</span> — {row.name}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {selectedRows.length > 0 && (
          <div className="hidden print:grid print:grid-cols-3 print:gap-4">
            {selectedRows.map((row) => (
              <div key={row.id} className="border border-dashed rounded-lg p-4 flex flex-col items-center gap-2 break-inside-avoid">
                <QRCodeSVG value={encodeQRData({ module, id: row.id, name: row.name })} size={140} level="H" includeMargin />
                <p className="text-xs font-semibold uppercase text-center">{getModuleDisplayName(module)}</p>
                <p className="text-sm font-bold text-center break-all">{row.id}</p>
                <p className="text-xs text-center break-all">{row.name}</p>
              </div>
            ))}
          </div>
        )}

        {selectedRows.length > 0 && (
          <div className="print:hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Preview ({selectedRows.length} label{selectedRows.length !== 1 && "s"})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedRows.map((row) => (
                <div key={row.id} className="border border-dashed rounded-lg p-4 flex flex-col items-center gap-2 bg-white text-black">
                  <QRCodeSVG value={encodeQRData({ module, id: row.id, name: row.name })} size={120} level="H" includeMargin />
                  <p className="text-[10px] font-semibold uppercase text-center">{getModuleDisplayName(module)}</p>
                  <p className="text-xs font-bold text-center break-all">{row.id}</p>
                  <p className="text-[10px] text-center break-all">{row.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
