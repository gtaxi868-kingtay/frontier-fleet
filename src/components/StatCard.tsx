import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  loading = false,
}: StatCardProps) {
  const iconStyles = {
    default: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex items-center gap-3 transition-colors duration-200 hover:bg-white/[0.05]">
      <div className={`shrink-0 p-2.5 rounded-lg ${iconStyles[variant]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-tactical font-semibold text-muted-foreground uppercase tracking-wider truncate">
          {title}
        </p>
        <div className="flex items-baseline gap-1.5">
          {loading ? (
            <div className="h-6 w-14 rounded bg-muted animate-pulse mt-0.5" />
          ) : (
            <h3 className="text-xl font-display font-bold tracking-tight text-foreground">{value}</h3>
          )}
          {trendValue && (
            <span
              className={`text-xs font-tactical font-semibold ${
                trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
