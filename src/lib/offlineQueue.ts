// Lightweight offline queue for POL/Fuel transactions.
// Field use case: a soldier issuing fuel with no signal — the action is
// stored locally and replayed automatically once connectivity returns.

const STORAGE_KEY = "pol_offline_queue";

export type QueuedAction =
  | { kind: "ISSUE"; tankId: string; liters: number; vehicleReg: string; driverName: string; driverId?: string; scanMethod?: "MANUAL" | "QR_VERIFIED" }
  | { kind: "RESUPPLY"; tankId: string; liters: number; supplierName: string; reference?: string }
  | { kind: "ADJUSTMENT"; tankId: string; liters: number; reason: string };

export interface QueueEntry {
  id: string;
  queuedAt: string;
  action: QueuedAction;
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: QueueEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getQueue(): QueueEntry[] {
  return readQueue();
}

export function enqueue(action: QueuedAction): QueueEntry {
  const entry: QueueEntry = {
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
    action,
  };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
  return entry;
}

export function removeFromQueue(id: string) {
  writeQueue(readQueue().filter((e) => e.id !== id));
}

export function queueLength(): number {
  return readQueue().length;
}
