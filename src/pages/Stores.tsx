import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse, Shield, Compass, HardHat, Wrench, Package, ArrowRight } from "lucide-react";

const CATEGORY_TABLES = [
  { key: "weapons", label: "Weapons", table: "weapons" },
  { key: "tools", label: "Tools", table: "tools" },
  { key: "uniforms", label: "Uniforms", table: "uniforms" },
  { key: "general_inventory", label: "General Inventory", table: "general_inventory" },
  { key: "plant_machinery", label: "Plant & Machinery", table: "plant_machinery" },
] as const;

interface Unit {
  id: string;
  name: string;
  location: string | null;
}

interface StoreSummary {
  id: string | "all";
  name: string;
  location: string | null;
  description: string;
  total: number;
  counts: Record<string, number>;
}

const unitIcon = (name: string) => {
  if (/support/i.test(name)) return Shield;
  if (/field/i.test(name)) return Compass;
  if (/construction/i.test(name)) return HardHat;
  if (/eme/i.test(name)) return Wrench;
  return Package;
};

const unitAccent = (name: string) => {
  if (/support/i.test(name)) return "border-accent/30 bg-gradient-to-br from-accent/10 to-background";
  if (/field/i.test(name)) return "border-primary/30 bg-gradient-to-br from-primary/10 to-background";
  if (/construction/i.test(name)) return "border-success/30 bg-gradient-to-br from-success/10 to-background";
  if (/eme/i.test(name)) return "border-destructive/30 bg-gradient-to-br from-destructive/10 to-background";
  return "border-border bg-gradient-to-br from-muted/20 to-background";
};

// unitId === null means "master": reserve stock not yet assigned to any
// squadron (squadron_id IS NULL) — NOT every row in the table. Master must
// stay disjoint from every sub-store's count or the two double-count the
// same physical items once squadrons have real assignments.
async function fetchCountsForUnit(unitId: string | null): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  await Promise.all(
    CATEGORY_TABLES.map(async ({ key, table }) => {
      let query = supabase.from(table).select("*", { count: "exact", head: true });
      query = unitId ? query.eq("squadron_id", unitId) : query.is("squadron_id", null);
      const { count } = await query;
      counts[key] = count || 0;
    })
  );
  return counts;
}

export default function Stores() {
  const [loading, setLoading] = useState(true);
  const [master, setMaster] = useState<StoreSummary | null>(null);
  const [subStores, setSubStores] = useState<StoreSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data: units } = await supabase.from("units").select("id, name, location").order("name");
      const unitList = (units || []) as Unit[];

      const [masterCounts, ...subCounts] = await Promise.all([
        fetchCountsForUnit(null),
        ...unitList.map((u) => fetchCountsForUnit(u.id)),
      ]);

      if (cancelled) return;

      setMaster({
        id: "all",
        name: "S4 Stores",
        location: "Master Store",
        description: "Master quartermaster stores. Holds reserve stock and oversees every squadron sub-store.",
        total: Object.values(masterCounts).reduce((a, b) => a + b, 0),
        counts: masterCounts,
      });

      setSubStores(
        unitList.map((u, i) => ({
          id: u.id,
          name: u.name,
          location: u.location,
          description: `Sub-store of S4 Stores`,
          total: Object.values(subCounts[i]).reduce((a, b) => a + b, 0),
          counts: subCounts[i],
        }))
      );

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stores Overview</h1>
            <p className="text-muted-foreground">Organisational store structure and holdings — S4 master store with squadron sub-stores</p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading stores…</p>
        ) : (
          <>
            {master && (
              <Link to={`/stores/${master.id}`} className="block group">
                <Card className="border-primary/40 bg-gradient-hero text-primary-foreground shadow-glow overflow-hidden relative hover:-translate-y-0.5 transition-all duration-300">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_60%)]" />
                  <CardContent className="p-6 relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-white/15 backdrop-blur-sm">
                          <Warehouse className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">{master.name}</h2>
                          <p className="text-sm text-primary-foreground/70">{master.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{master.total}</div>
                        <div className="text-xs uppercase tracking-wider text-primary-foreground/70">Items</div>
                      </div>
                    </div>
                    <p className="text-sm text-primary-foreground/80">{master.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_TABLES.map(({ key, label }) => (
                        <Badge key={key} className="bg-white/15 hover:bg-white/20 text-primary-foreground border-0">
                          {label} · {master.counts[key]}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium pt-1 group-hover:translate-x-1 transition-transform">
                      Open store <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {subStores.map((store) => {
                const Icon = unitIcon(store.name);
                return (
                  <Link key={store.id} to={`/stores/${store.id}`} className="block group">
                    <Card className={`${unitAccent(store.name)} border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{store.name}</h3>
                              <p className="text-xs text-muted-foreground">{store.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{store.total}</div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Items</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORY_TABLES.slice(0, 3).map(({ key, label }) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {label} · {store.counts[key]}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-primary pt-1 group-hover:translate-x-1 transition-transform">
                          Open store <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
