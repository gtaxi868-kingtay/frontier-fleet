import { supabase } from "@/integrations/supabase/client";

export type FuelType = "unleaded" | "diesel_a" | "diesel_b";
export type DipSeverity = "OK" | "MONITOR" | "ALERT" | "CRITICAL" | "REFERENCE";
export type DipContext = "routine" | "pre_resupply" | "post_resupply";

export interface DashboardTank {
  id: string;
  label: string;
  fuel_type: FuelType;
  capacity_liters: number;
  is_active: boolean;
  current_liters: number;
  percentage: number;
  last_resupply_at: string | null;
  latest_dip_id: string | null;
  latest_dip_status: DipSeverity | null;
  latest_dip_discrepancy: number | null;
  latest_dip_period_variance: number | null;
  latest_dip_is_reference: boolean | null;
  latest_dip_date: string | null;
  dip_confirmed_at: string | null;
}

export interface DipGap {
  tank_id: string;
  tank_label: string;
  fuel_type: FuelType;
  last_dip_date: string | null;
  last_dip_measured: number | null;
  last_dip_discrepancy: number | null;
  last_dip_severity: DipSeverity | null;
  current_book_level: number;
  days_since_last_dip: number;
  status: "NEVER_DIPPED" | "OVERDUE" | "DONE_TODAY" | "DUE_TODAY";
}

export interface RecentDip {
  id: string;
  tank_id: string;
  tank_label: string;
  tank_fuel_type: string;
  measured_liters: number;
  book_level: number;
  discrepancy: number;
  period_variance: number | null;
  is_reference_only: boolean;
  reading_suspect: boolean;
  severity: DipSeverity;
  dip_context: DipContext;
  dip_date: string;
  dip_time: string;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface FuelTransactionRow {
  id: string;
  tank_id: string;
  transaction_type: "OPENING" | "ISSUE" | "RESUPPLY" | "ADJUSTMENT";
  liters: number;
  vehicle_registration: string | null;
  driver_name: string | null;
  supplier_name: string | null;
  reference_number: string | null;
  created_at: string;
  fuel_tanks?: { label: string; fuel_type: string };
}

export async function getDashboardTanks(): Promise<DashboardTank[]> {
  const { data, error } = await supabase.rpc("get_dashboard_tanks");
  if (error) {
    console.error("getDashboardTanks", error);
    return [];
  }
  return (data as DashboardTank[]) || [];
}

export async function getDipGaps(): Promise<DipGap[]> {
  const { data, error } = await supabase.rpc("detect_dip_gaps");
  if (error) {
    console.error("getDipGaps", error);
    return [];
  }
  return (data as DipGap[]) || [];
}

export async function getRecentDips(limit = 20): Promise<RecentDip[]> {
  const { data, error } = await supabase.rpc("get_recent_dips_rpc", { p_limit: limit });
  if (error) {
    console.error("getRecentDips", error);
    return [];
  }
  return (data as RecentDip[]) || [];
}

export async function getRecentTransactions(limit = 20): Promise<FuelTransactionRow[]> {
  const { data, error } = await supabase
    .from("fuel_transactions")
    .select("*, fuel_tanks(label, fuel_type)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getRecentTransactions", error);
    return [];
  }
  return (data as unknown as FuelTransactionRow[]) || [];
}

export async function issueFuel(params: {
  tankId: string;
  liters: number;
  vehicleReg: string;
  driverName: string;
  driverId?: string;
  scanMethod?: "MANUAL" | "QR_VERIFIED";
}): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("pol_issue_fuel", {
    p_tank_id: params.tankId,
    p_liters: params.liters,
    p_vehicle_reg: params.vehicleReg,
    p_driver_name: params.driverName,
    p_driver_id: params.driverId || null,
    p_scan_method: params.scanMethod || "MANUAL",
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string };
}

export async function resupplyFuel(params: {
  tankId: string;
  liters: number;
  supplierName: string;
  reference?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("pol_resupply_fuel", {
    p_tank_id: params.tankId,
    p_liters: params.liters,
    p_supplier_name: params.supplierName,
    p_reference_number: params.reference || null,
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string };
}

export async function adjustFuel(params: {
  tankId: string;
  liters: number;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("pol_adjust_fuel", {
    p_tank_id: params.tankId,
    p_liters: params.liters,
    p_reason: params.reason,
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string };
}

export async function recordDipTest(params: {
  tankId: string;
  measuredLiters: number;
  dipTime: "morning" | "evening" | "spot_check";
  notes?: string;
  dipContext?: DipContext;
}): Promise<any> {
  const { data, error } = await supabase.rpc("record_dip_test", {
    p_tank_id: params.tankId,
    p_measured_liters: params.measuredLiters,
    p_dip_time: params.dipTime,
    p_notes: params.notes || null,
    p_dip_context: params.dipContext || "routine",
  });
  if (error) throw error;
  return data;
}

export async function confirmDipTest(dipId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("confirm_dip_test", { p_dip_id: dipId, p_notes: notes || null });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string };
}

export async function alignBooksFromDip(dipId: string): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc("align_books_from_dip", { p_dip_id: dipId });
  if (error) throw error;
  return data as { success: boolean; message?: string };
}

export interface PendingVehicle {
  id: string;
  registration: string;
  vehicle_type: string;
  make_model: string | null;
  created_at: string;
  added_by_name: string | null;
  refuel_count: number;
  total_liters: number;
}

export async function getPendingVehicles(): Promise<PendingVehicle[]> {
  const { data, error } = await supabase.rpc("get_pending_vehicles");
  if (error) {
    console.error("getPendingVehicles", error);
    return [];
  }
  return (data as PendingVehicle[]) || [];
}

export async function approveVehicle(
  vehicleId: string,
  vehicleType?: string,
  makeModel?: string
): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc("approve_vehicle", {
    p_vehicle_id: vehicleId,
    p_vehicle_type: vehicleType || null,
    p_make_model: makeModel || null,
  });
  if (error) return { success: false, message: error.message };
  return data as { success: boolean; message?: string };
}

export async function rejectVehicle(vehicleId: string): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc("reject_vehicle", { p_vehicle_id: vehicleId });
  if (error) return { success: false, message: error.message };
  return data as { success: boolean; message?: string };
}
