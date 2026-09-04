import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import {
  Crosshair,
  Wrench,
  HardHat,
  Truck,
  Shirt,
  AlertTriangle,
  Car,
  PackageOpen,
} from "lucide-react";

// Every module a Soldier can personally hold, with the column that links a
// row to them. Two different column names exist across the schema
// (issued_to for consumables/arms, operator_assigned / assigned_to for
// plant & vehicles) so each module carries its own.
const MY_ITEM_MODULES = [
  { key: "weapons", label: "Weapons", table: "weapons", column: "issued_to", icon: Crosshair, idField: "weapon_id", nameField: "weapon_type" },
  { key: "tools", label: "Tools", table: "tools", column: "issued_to", icon: Wrench, idField: "tool_id", nameField: "tool_name" },
  { key: "engineer_equipment", label: "Engineer Equipment", table: "engineer_equipment", column: "issued_to", icon: HardHat, idField: "equip_id", nameField: "equipment_name" },
  { key: "uniforms", label: "Uniforms", table: "uniforms", column: "issued_to", icon: Shirt, idField: "uniform_id", nameField: "item_name" },
  { key: "ppe", label: "PPE", table: "ppe", column: "issued_to", icon: AlertTriangle, idField: "ppe_id", nameField: "item" },
  { key: "plant_machinery", label: "Plant & Machinery", table: "plant_machinery", column: "operator_assigned", icon: Truck, idField: "plant_id", nameField: "type" },
  { key: "vehicles", label: "Vehicles", table: "vehicles", column: "assigned_to", icon: Car, idField: "vehicle_id", nameField: "vehicle_type" },
] as const;

interface MyItem {
  module: (typeof MY_ITEM_MODULES)[number];
  row: any;
}

export default function MyKit() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchMyItems = async () => {
      setLoading(true);
      const results = await Promise.all(
        MY_ITEM_MODULES.map(async (module) => {
          // weapons.serial_number must never ride along in a plain list
          // fetch (see useInventoryData.ts and get_weapon_serials — the
          // same PIN-gated-reveal rule applies here even though it's the
          // soldier's own weapon: this view is a quick overview, not the
          // sensitive detail screen).
          const selectClause =
            module.table === "weapons"
              ? "id,weapon_id,weapon_type,squadron_id,issued_to,issue_date,return_date,condition_issue,serviceable,last_inspection_date,next_inspection_due,survey_report_filed,notes,created_at,updated_at,rack_number,store_location,service_number,rank,name,mag_amount,page_64_no"
              : "*";
          const { data, error } = await supabase
            .from(module.table)
            .select(selectClause)
            .eq(module.column, user.id);
          if (error) {
            console.error(`Failed to load ${module.table} for My Kit:`, error);
            return [];
          }
          return (data || []).map((row: any) => ({ module, row }));
        })
      );
      if (!cancelled) {
        setItems(results.flat());
        setLoading(false);
      }
    };

    fetchMyItems();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isServiceable = (row: any) =>
    typeof row.serviceable === "boolean" ? row.serviceable : row.serviceability === "Serviceable";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            My Kit
          </h1>
          <p className="text-muted-foreground mt-1">
            Every item currently issued or assigned to {profile?.name || "you"}
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading your kit...</p>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-2">
            <PackageOpen className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="font-medium">Nothing issued to you right now</p>
            <p className="text-sm text-muted-foreground">
              Items your storeman issues to you will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(({ module, row }) => {
              const Icon = module.icon;
              const serviceable = isServiceable(row);
              return (
                <div
                  key={`${module.table}-${row.id}`}
                  className="glass-panel rounded-xl p-4 space-y-3 cursor-pointer hover:bg-white/[0.05] transition-colors"
                  onClick={() => {
                    setSelectedItem(row);
                    setDetailOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-tactical">
                        {module.label}
                      </p>
                      <p className="font-medium truncate">{row[module.nameField] || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-mono">{row[module.idField]}</span>
                    <span
                      className={
                        serviceable
                          ? "text-success text-xs font-semibold uppercase"
                          : "text-destructive text-xs font-semibold uppercase"
                      }
                    >
                      {serviceable ? "Serviceable" : "Unserviceable"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedItem && (
        <ItemDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title="Item Detail"
          data={selectedItem}
        />
      )}
    </div>
  );
}
