import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, QrCode, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { decodeQRData } from "@/lib/qr-utils";

const RANK_ORDER = [
  "Private", "Lance Corporal", "Corporal", "Sergeant", "Staff Sergeant",
  "Warrant Officer II", "Warrant Officer I", "Second Lieutenant", "Lieutenant",
  "Captain", "Major", "Lieutenant Colonel", "Colonel",
];

function isEligibleForOrderlyOfficer(rank: string | null | undefined): boolean {
  if (!rank) return false;
  const idx = RANK_ORDER.indexOf(rank);
  return idx >= 4 && idx <= 7; // Staff Sergeant (index 4) through Second Lieutenant (index 7)
}

interface CheckItem {
  id: string;
  weapon_id: string;
  checked_at: string | null;
  weapons: { weapon_id: string; weapon_type: string } | null;
}

export default function PhysicalCheck() {
  const { profile } = useAuth();
  const eligible = isEligibleForOrderlyOfficer(profile?.rank);

  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [items, setItems] = useState<CheckItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    supabase
      .from("units")
      .select("id, name")
      .neq("name", "EME Squadron") // EME never holds weapons
      .order("name")
      .then(({ data }) => setUnits(data || []));
  }, []);

  const loadItems = async (checkId: string) => {
    const { data } = await supabase
      .from("weapon_physical_check_items")
      .select("*, weapons(weapon_id, weapon_type)")
      .eq("check_id", checkId);
    setItems((data as unknown as CheckItem[]) || []);
  };

  const startCheck = async () => {
    if (!selectedUnitId) {
      toast.error("Select a unit first");
      return;
    }
    setStarting(true);
    const { data, error } = await supabase.rpc("start_physical_check", { p_unit_id: selectedUnitId });
    setStarting(false);
    const result = data as { success: boolean; check_id?: string; error?: string };
    if (error || !result?.success) {
      toast.error(result?.error || error?.message || "Failed to start check");
      return;
    }
    setActiveCheckId(result.check_id!);
    loadItems(result.check_id!);
    toast.success("Physical check started — scan each weapon");
  };

  const handleScan = async (raw: string) => {
    if (!activeCheckId) return;
    const decoded = decodeQRData(raw);
    const weaponDbId = items.find((i) => i.weapons?.weapon_id === (decoded?.id || raw))?.weapon_id;

    // decoded.id is the weapons.id (uuid) per encodeQRData's convention when
    // generated from QRCodeLabel; fall back to matching on the visible
    // weapon_id text if the scan doesn't decode as structured data.
    const targetWeaponId = decoded?.module === "weapons" ? decoded.id : weaponDbId;
    if (!targetWeaponId) {
      toast.error("QR code doesn't match a weapon in this check");
      return;
    }

    const { data, error } = await supabase.rpc("check_off_weapon", {
      p_check_id: activeCheckId,
      p_weapon_id: targetWeaponId,
    });
    const result = data as { success: boolean; error?: string };
    if (error || !result?.success) {
      toast.error(result?.error || error?.message || "Failed to check off weapon");
      return;
    }
    toast.success("Checked off");
    loadItems(activeCheckId);
  };

  const completeCheck = async () => {
    if (!activeCheckId) return;
    const { data, error } = await supabase.rpc("complete_physical_check", { p_check_id: activeCheckId });
    const result = data as { success: boolean; missing_count?: number; error?: string };
    if (error || !result?.success) {
      toast.error(result?.error || error?.message || "Failed to complete check");
      return;
    }
    if (result.missing_count && result.missing_count > 0) {
      toast.warning(`Check complete — ${result.missing_count} weapon(s) not accounted for. Notice sent to S4/CO/RSM.`);
    } else {
      toast.success("Check complete — all weapons accounted for");
    }
    setActiveCheckId(null);
    setItems([]);
  };

  const checkedCount = items.filter((i) => i.checked_at).length;

  if (!eligible) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <Card className="max-w-md mx-auto border-warning/40 bg-warning/5">
            <CardContent className="p-6 text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
              <h3 className="font-semibold">Not Eligible for Orderly Officer Duty</h3>
              <p className="text-sm text-muted-foreground">
                Running an armoury physical check requires rank Staff Sergeant through Second Lieutenant. Your
                recorded rank is {profile?.rank || "not set"}.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Armoury Physical Check</h1>
            <p className="text-muted-foreground">Scan every weapon in the store against system records</p>
          </div>
        </div>

        {!activeCheckId ? (
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Start a New Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit armoury" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={startCheck} disabled={starting}>
                Start Check
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {checkedCount} / {items.length} weapons checked off
                  </p>
                  <p className="text-sm text-muted-foreground">Scan each weapon's QR label to check it off</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setScannerOpen(true)}>
                    <QrCode className="h-4 w-4 mr-2" /> Scan
                  </Button>
                  <Button className="flex-1 sm:flex-none" onClick={completeCheck}>Complete Check</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.checked_at ? "border-success/40 bg-success/5" : "border-border/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.weapons?.weapon_id}</p>
                    <p className="text-xs text-muted-foreground">{item.weapons?.weapon_type}</p>
                  </div>
                  {item.checked_at ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
        title="Scan Weapon QR"
        description="Scan the weapon's QR label to check it off"
      />
    </div>
  );
}
