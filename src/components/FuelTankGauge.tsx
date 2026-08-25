export type FuelLevelStatus = "optimal" | "caution" | "critical";

export function getFuelLevelStatus(percentage: number): FuelLevelStatus {
  if (percentage < 20) return "critical";
  if (percentage < 50) return "caution";
  return "optimal";
}

const STATUS_COLOR: Record<FuelLevelStatus, string> = {
  optimal: "hsl(var(--success))",
  caution: "hsl(var(--warning))",
  critical: "hsl(var(--destructive))",
};

const STATUS_LABEL: Record<FuelLevelStatus, string> = {
  optimal: "OPTIMAL",
  caution: "CAUTION",
  critical: "CRITICAL",
};

interface FuelTankGaugeProps {
  percentage: number;
  currentLiters: number;
  capacityLiters: number;
}

export function FuelTankGauge({ percentage, currentLiters, capacityLiters }: FuelTankGaugeProps) {
  const pct = Math.max(0, Math.min(100, percentage));
  const status = getFuelLevelStatus(pct);
  const color = STATUS_COLOR[status];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col justify-between text-[10px] text-muted-foreground font-mono py-1 shrink-0 w-9 text-right">
        <span>FULL</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>EMPTY</span>
      </div>

      <div
        className="fuel-tank relative flex-1 h-36 rounded-md border border-primary/30 bg-background/60 overflow-hidden"
        role="img"
        aria-label={`${tankAriaLabel(currentLiters, capacityLiters, pct, status)}`}
      >
        <div className="absolute inset-0 fuel-tank-grid" />
        <div
          className={`fuel-tank-fill absolute bottom-0 left-0 right-0 ${status === "optimal" ? "fuel-tank-pulse" : ""}`}
          style={{
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${color}cc, ${color})`,
            boxShadow: `0 0 16px ${color}66 inset`,
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
          <span className="text-lg font-bold font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{pct}%</span>
          <span className="text-[10px] font-mono text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {Math.round(currentLiters).toLocaleString()}L / {capacityLiters.toLocaleString()}L
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end shrink-0">
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ color, border: `1px solid ${color}66`, background: `${color}1a` }}
        >
          {STATUS_LABEL[status]}
        </span>
        {status === "critical" && (
          <span className="text-[10px] font-mono font-bold text-destructive animate-pulse">
            REFUEL NOW
          </span>
        )}
      </div>
    </div>
  );
}

function tankAriaLabel(currentLiters: number, capacityLiters: number, pct: number, status: FuelLevelStatus) {
  return `${Math.round(currentLiters)} of ${capacityLiters} liters, ${pct} percent, status ${status}`;
}
