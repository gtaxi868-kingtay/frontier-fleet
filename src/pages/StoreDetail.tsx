import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Warehouse,
  ChevronLeft,
  Crosshair,
  Wrench,
  HardHat,
  Truck,
  Flame,
  Shirt,
  AlertTriangle,
  Building,
  Boxes,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  { key: "weapons", label: "Weapons", table: "weapons", icon: Crosshair, link: "/weapons" },
  { key: "tools", label: "Tools", table: "tools", icon: Wrench, link: "/tools" },
  { key: "engineer_equipment", label: "Engineer Equipment", table: "engineer_equipment", icon: HardHat, link: "/engineer-equipment" },
  { key: "plant_machinery", label: "Plant & Machinery", table: "plant_machinery", icon: Truck, link: "/plant-machinery" },
  { key: "explosives", label: "Explosives", table: "explosives", icon: Flame, link: "/explosives" },
  { key: "uniforms", label: "Uniforms", table: "uniforms", icon: Shirt, link: "/uniforms" },
  { key: "ppe", label: "PPE", table: "ppe", icon: AlertTriangle, link: "/ppe" },
  { key: "facilities", label: "Facilities", table: "facilities", icon: Building, link: "/facilities" },
  { key: "general_inventory", label: "General Inventory", table: "general_inventory", icon: Boxes, link: "/inventory" },
] as const;

interface Unit {
  id: string;
  name: string;
  location: string | null;
}

export default function StoreDetail() {
  const { unitId } = useParams<{ unitId: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const isMaster = unitId === "all";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      if (!isMaster && unitId) {
        const { data } = await supabase.from("units").select("id, name, location").eq("id", unitId).single();
        if (!cancelled) setUnit(data as Unit);
      } else {
        setUnit(null);
      }

      const results: Record<string, number> = {};
      await Promise.all(
        CATEGORIES.map(async ({ key, table }) => {
          let query = supabase.from(table).select("*", { count: "exact", head: true });
          query = !isMaster && unitId ? query.eq("squadron_id", unitId) : query.is("squadron_id", null);
          const { count } = await query;
          results[key] = count || 0;
        })
      );
      if (!cancelled) {
        setCounts(results);
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [unitId, isMaster]);

  const title = isMaster ? "S4 Stores" : unit?.name || "Store";
  const subtitle = isMaster
    ? "Master quartermaster stores — reserve stock across all squadrons"
    : unit?.location || "Squadron sub-store";
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/stores" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Stores
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{loading ? "…" : title}</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{loading ? "…" : title}</h1>
              <p className="text-muted-foreground">{loading ? "" : subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{loading ? "…" : total}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Items</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ key, label, icon: Icon, link }) => (
            <Link
              key={key}
              to={isMaster ? link : `${link}?unit=${unitId}`}
              className="block group"
            >
              <Card className="border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{loading ? "…" : `${counts[key] ?? 0} tracked`}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!isMaster && (
          <p className="text-xs text-muted-foreground">
            Opening a category here scopes it to {title} for command roles — unit-scoped users always see only their
            own unit regardless.
          </p>
        )}
      </main>
    </div>
  );
}
