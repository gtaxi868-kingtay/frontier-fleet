import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FuelTankGauge } from "@/components/FuelTankGauge";
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
import { Fuel, Droplets, TrendingDown, AlertTriangle, Gauge, ClipboardCheck, CheckCircle2, Car, X, QrCode, ShieldCheck } from "lucide-react";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { decodeQRData } from "@/lib/qr-utils";
import { isOnline, enqueue, getQueue, removeFromQueue, type QueueEntry } from "@/lib/offlineQueue";
import { WifiOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  getDashboardTanks,
  getDipGaps,
  getRecentDips,
  getRecentTransactions,
  issueFuel,
  resupplyFuel,
  adjustFuel,
  recordDipTest,
  confirmDipTest,
  alignBooksFromDip,
  getPendingVehicles,
  approveVehicle,
  rejectVehicle,
  type DashboardTank,
  type DipGap,
  type RecentDip,
  type FuelTransactionRow,
  type PendingVehicle,
} from "@/lib/polFuel";

const severityColor: Record<string, string> = {
  OK: "bg-success/15 text-success border-success/30",
  MONITOR: "bg-warning/15 text-warning border-warning/30",
  ALERT: "bg-destructive/15 text-destructive border-destructive/30",
  CRITICAL: "bg-destructive/25 text-destructive border-destructive/50",
  REFERENCE: "bg-muted text-muted-foreground border-border",
};

const fuelLabel: Record<string, string> = {
  unleaded: "Unleaded",
  diesel_a: "Diesel A",
  diesel_b: "Diesel B",
};

export default function PolFuel() {
  const { role, profile } = useAuth();
  const canWrite = ["MTO", "S4", "S4_ADMIN"].includes(role || "");
  const canConfirm = ["S4", "CO"].includes(role || "");

  const [tanks, setTanks] = useState<DashboardTank[]>([]);
  const [gaps, setGaps] = useState<DipGap[]>([]);
  const [dips, setDips] = useState<RecentDip[]>([]);
  const [txs, setTxs] = useState<FuelTransactionRow[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<PendingVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [resupplyOpen, setResupplyOpen] = useState(false);
  const [dipOpen, setDipOpen] = useState(false);
  const [selectedTankId, setSelectedTankId] = useState<string>("");

  const [issueForm, setIssueForm] = useState({ liters: "", vehicleReg: "", driverName: "" });
  const [issueScanMethod, setIssueScanMethod] = useState<"MANUAL" | "QR_VERIFIED">("MANUAL");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [queuedEntries, setQueuedEntries] = useState<QueueEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [resupplyForm, setResupplyForm] = useState({ liters: "", supplierName: "", reference: "" });
  const [dipForm, setDipForm] = useState({ measured: "", dipTime: "morning", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, g, d, tx, pv] = await Promise.all([
      getDashboardTanks(),
      getDipGaps(),
      getRecentDips(10),
      getRecentTransactions(15),
      canConfirm ? getPendingVehicles() : Promise.resolve([]),
    ]);
    setTanks(t);
    setGaps(g);
    setDips(d);
    setTxs(tx);
    setPendingVehicles(pv);
    setLoading(false);
  };

  const syncQueue = async () => {
    if (!isOnline()) return;
    const queue = getQueue();
    if (queue.length === 0) return;
    setSyncing(true);
    for (const entry of queue) {
      try {
        let res: { success: boolean };
        if (entry.action.kind === "ISSUE") {
          res = await issueFuel({
            tankId: entry.action.tankId,
            liters: entry.action.liters,
            vehicleReg: entry.action.vehicleReg,
            driverName: entry.action.driverName,
            driverId: entry.action.driverId,
            scanMethod: entry.action.scanMethod,
          });
        } else if (entry.action.kind === "RESUPPLY") {
          res = await resupplyFuel({
            tankId: entry.action.tankId,
            liters: entry.action.liters,
            supplierName: entry.action.supplierName,
            reference: entry.action.reference,
          });
        } else {
          res = await adjustFuel({ tankId: entry.action.tankId, liters: entry.action.liters, reason: entry.action.reason });
        }
        if (res.success) {
          removeFromQueue(entry.id);
        } else {
          break; // still failing — stop and retry later
        }
      } catch {
        break; // likely still offline
      }
    }
    setQueuedEntries(getQueue());
    setSyncing(false);
    load();
  };

  useEffect(() => {
    load();
    setQueuedEntries(getQueue());
    syncQueue();

    const handleOnline = () => syncQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const openIssue = (tankId: string) => {
    setSelectedTankId(tankId);
    setIssueForm({ liters: "", vehicleReg: "", driverName: "" });
    setIssueScanMethod("MANUAL");
    setIssueOpen(true);
  };

  const handleQRScan = (raw: string) => {
    const decoded = decodeQRData(raw);
    if (decoded && decoded.module === "vehicles") {
      setIssueForm((f) => ({ ...f, vehicleReg: decoded.name }));
      setIssueScanMethod("QR_VERIFIED");
      toast.success(`Vehicle ${decoded.name} verified via QR`);
    } else {
      // Not a recognized vehicle QR — treat raw text as the plate number
      setIssueForm((f) => ({ ...f, vehicleReg: raw }));
      setIssueScanMethod("QR_VERIFIED");
    }
  };
  const openResupply = (tankId: string) => {
    setSelectedTankId(tankId);
    setResupplyForm({ liters: "", supplierName: "", reference: "" });
    setResupplyOpen(true);
  };
  const openDip = (tankId: string) => {
    setSelectedTankId(tankId);
    setDipForm({ measured: "", dipTime: "morning", notes: "" });
    setDipOpen(true);
  };

  const submitIssue = async () => {
    const liters = parseFloat(issueForm.liters);
    if (!liters || liters <= 0 || !issueForm.vehicleReg || !issueForm.driverName) {
      toast.error("Fill in liters, vehicle registration, and driver name");
      return;
    }

    if (!isOnline()) {
      enqueue({
        kind: "ISSUE",
        tankId: selectedTankId,
        liters,
        vehicleReg: issueForm.vehicleReg,
        driverName: issueForm.driverName,
        scanMethod: issueScanMethod,
      });
      setQueuedEntries(getQueue());
      toast.info("Offline — fuel issue queued, will sync when connection returns");
      setIssueOpen(false);
      return;
    }

    setSubmitting(true);
    const res = await issueFuel({
      tankId: selectedTankId,
      liters,
      vehicleReg: issueForm.vehicleReg,
      driverName: issueForm.driverName,
      scanMethod: issueScanMethod,
    });
    setSubmitting(false);
    if (!res.success) {
      // Network-shaped failure while "online" per the browser — queue it too
      enqueue({
        kind: "ISSUE",
        tankId: selectedTankId,
        liters,
        vehicleReg: issueForm.vehicleReg,
        driverName: issueForm.driverName,
        scanMethod: issueScanMethod,
      });
      setQueuedEntries(getQueue());
      toast.warning(`Couldn't reach server (${res.error || "unknown error"}) — queued for retry`);
      setIssueOpen(false);
      return;
    }
    toast.success("Fuel issued");
    setIssueOpen(false);
    load();
  };

  const submitResupply = async () => {
    const liters = parseFloat(resupplyForm.liters);
    if (!liters || liters <= 0 || !resupplyForm.supplierName) {
      toast.error("Fill in liters and supplier name");
      return;
    }

    if (!isOnline()) {
      enqueue({
        kind: "RESUPPLY",
        tankId: selectedTankId,
        liters,
        supplierName: resupplyForm.supplierName,
        reference: resupplyForm.reference,
      });
      setQueuedEntries(getQueue());
      toast.info("Offline — resupply queued, will sync when connection returns");
      setResupplyOpen(false);
      return;
    }

    setSubmitting(true);
    const res = await resupplyFuel({
      tankId: selectedTankId,
      liters,
      supplierName: resupplyForm.supplierName,
      reference: resupplyForm.reference,
    });
    setSubmitting(false);
    if (!res.success) {
      enqueue({
        kind: "RESUPPLY",
        tankId: selectedTankId,
        liters,
        supplierName: resupplyForm.supplierName,
        reference: resupplyForm.reference,
      });
      setQueuedEntries(getQueue());
      toast.warning(`Couldn't reach server (${res.error || "unknown error"}) — queued for retry`);
      setResupplyOpen(false);
      return;
    }
    toast.success("Resupply recorded");
    setResupplyOpen(false);
    load();
  };

  const submitDip = async () => {
    const measured = parseFloat(dipForm.measured);
    if (isNaN(measured) || measured < 0) {
      toast.error("Enter a valid measured amount");
      return;
    }
    setSubmitting(true);
    try {
      const result = await recordDipTest({
        tankId: selectedTankId,
        measuredLiters: measured,
        dipTime: dipForm.dipTime as any,
        notes: dipForm.notes,
      });
      toast.success(
        result?.is_reference_only
          ? "Dip recorded (reference only — no activity today)"
          : `Dip recorded — ${result?.severity} (${result?.discrepancy}L discrepancy)`
      );
      setDipOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to record dip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDip = async (dipId: string) => {
    const res = await confirmDipTest(dipId);
    if (!res.success) {
      toast.error(res.error || "Failed to confirm");
      return;
    }
    toast.success("Dip confirmed");
    load();
  };

  const handleAlignBooks = async (dipId: string) => {
    try {
      const res = await alignBooksFromDip(dipId);
      toast.success(res.message || "Books aligned");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to align books");
    }
  };

  const handleApproveVehicle = async (id: string) => {
    const res = await approveVehicle(id);
    if (!res.success) {
      toast.error(res.message || "Failed to approve");
      return;
    }
    toast.success("Vehicle approved");
    load();
  };

  const handleRejectVehicle = async (id: string) => {
    const res = await rejectVehicle(id);
    if (!res.success) {
      toast.error(res.message || "Failed to reject");
      return;
    }
    toast.success("Vehicle rejected");
    load();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Fuel className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POL / Fuel Ledger</h1>
            <p className="text-muted-foreground">Tank levels, issue/resupply tracking, and physical dip verification</p>
          </div>
        </div>

        {queuedEntries.length > 0 && (
          <Card className="border-accent/40 bg-accent/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    {queuedEntries.length} transaction{queuedEntries.length > 1 ? "s" : ""} pending sync
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recorded locally while offline — will sync automatically when connection returns.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={syncQueue} disabled={syncing}>
                <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`} /> Retry Now
              </Button>
            </CardContent>
          </Card>
        )}

        {gaps.some((g) => g.status === "OVERDUE" || g.status === "NEVER_DIPPED") && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Dip tests overdue</p>
                {gaps
                  .filter((g) => g.status === "OVERDUE" || g.status === "NEVER_DIPPED")
                  .map((g) => (
                    <p key={g.tank_id} className="text-sm text-muted-foreground">
                      {g.tank_label} —{" "}
                      {g.status === "NEVER_DIPPED" ? "never dipped" : `${g.days_since_last_dip} day(s) since last dip`}
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {canConfirm && pendingVehicles.length > 0 && (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4" /> Pending Vehicle Registrations ({pendingVehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingVehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{v.registration}</p>
                    <p className="text-xs text-muted-foreground">
                      Auto-registered by {v.added_by_name || "unknown"} · {v.refuel_count} refuel(s), {v.total_liters}L total
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleApproveVehicle(v.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRejectVehicle(v.id)}>
                      <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {tanks.map((tank) => (
            <Card key={tank.id} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    {tank.label}
                  </CardTitle>
                  {tank.latest_dip_status && (
                    <Badge variant="outline" className={severityColor[tank.latest_dip_status]}>
                      {tank.latest_dip_status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FuelTankGauge
                  percentage={tank.percentage}
                  currentLiters={tank.current_liters}
                  capacityLiters={tank.capacity_liters}
                />
                {canWrite && (
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" onClick={() => openIssue(tank.id)}>
                      Issue
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openResupply(tank.id)}>
                      Resupply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDip(tank.id)}>
                      Dip Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" /> Recent Dip Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dips.length === 0 && <p className="text-sm text-muted-foreground">No dip tests recorded yet.</p>}
              {dips.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{d.tank_label}</span>
                      <Badge variant="outline" className={severityColor[d.severity]}>
                        {d.is_reference_only ? "REFERENCE" : d.severity}
                      </Badge>
                      {d.reading_suspect && (
                        <Badge variant="outline" className="text-warning border-warning/30">
                          Suspect reading
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Measured {d.measured_liters}L · Book {d.book_level}L ·{" "}
                      {d.is_reference_only ? "no activity today" : `${d.discrepancy > 0 ? "-" : "+"}${Math.abs(d.discrepancy)}L`}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  {canConfirm && !d.is_reference_only && (d.severity === "ALERT" || d.severity === "CRITICAL") && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleConfirmDip(d.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAlignBooks(d.id)}>
                        Align Books
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {txs.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
              {txs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{tx.transaction_type}</Badge>
                      <span className="font-medium text-sm">{tx.fuel_tanks?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tx.transaction_type === "ISSUE"
                        ? `${tx.vehicle_registration || "—"} · ${tx.driver_name || "—"}`
                        : tx.transaction_type === "RESUPPLY"
                        ? tx.supplier_name || "—"
                        : tx.reference_number || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-semibold text-sm ${tx.transaction_type === "ISSUE" ? "text-destructive" : "text-success"}`}>
                      {tx.transaction_type === "ISSUE" ? "-" : "+"}
                      {tx.liters}L
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Issue Fuel Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Issue Fuel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Liters</Label>
              <Input
                type="number"
                value={issueForm.liters}
                onChange={(e) => setIssueForm({ ...issueForm, liters: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="flex items-center justify-between">
                <span>Vehicle Registration</span>
                {issueScanMethod === "QR_VERIFIED" && (
                  <span className="flex items-center gap-1 text-xs text-success font-normal">
                    <ShieldCheck className="h-3 w-3" /> QR Verified
                  </span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={issueForm.vehicleReg}
                  onChange={(e) => {
                    setIssueForm({ ...issueForm, vehicleReg: e.target.value });
                    setIssueScanMethod("MANUAL");
                  }}
                  placeholder="e.g., TTDF-1234"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setScannerOpen(true)}>
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input
                value={issueForm.driverName}
                onChange={(e) => setIssueForm({ ...issueForm, driverName: e.target.value })}
                placeholder="Driver full name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitIssue} disabled={submitting}>
              Issue Fuel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resupply Dialog */}
      <Dialog open={resupplyOpen} onOpenChange={setResupplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="h-4 w-4" /> Record Resupply
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Liters Delivered</Label>
              <Input
                type="number"
                value={resupplyForm.liters}
                onChange={(e) => setResupplyForm({ ...resupplyForm, liters: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                value={resupplyForm.supplierName}
                onChange={(e) => setResupplyForm({ ...resupplyForm, supplierName: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label>Delivery Note / Invoice (optional)</Label>
              <Input
                value={resupplyForm.reference}
                onChange={(e) => setResupplyForm({ ...resupplyForm, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResupplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitResupply} disabled={submitting}>
              Record Resupply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dip Test Dialog */}
      <Dialog open={dipOpen} onOpenChange={setDipOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Record Dip Test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Measured Liters (physical reading)</Label>
              <Input
                type="number"
                value={dipForm.measured}
                onChange={(e) => setDipForm({ ...dipForm, measured: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Time of Day</Label>
              <Select value={dipForm.dipTime} onValueChange={(v) => setDipForm({ ...dipForm, dipTime: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="spot_check">Spot Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={dipForm.notes}
                onChange={(e) => setDipForm({ ...dipForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDipOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitDip} disabled={submitting}>
              Record Dip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
        title="Scan Vehicle QR"
        description="Scan the vehicle's QR label, or enter its registration manually"
      />
    </div>
  );
}
