import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroStatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionLink?: string;
  loading?: boolean;
}

export function HeroStatCard({ label, value, subtitle, icon: Icon, actionLabel, actionLink, loading = false }: HeroStatCardProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 fuel-tank-grid opacity-30 pointer-events-none" />
      <div className="p-6 sm:p-8 relative space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-primary">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        {loading ? (
          <div className="h-12 w-40 rounded-lg bg-muted animate-pulse" />
        ) : (
          <div className="text-5xl sm:text-6xl font-display font-black tracking-tight text-foreground">{value}</div>
        )}
        <p className="text-muted-foreground text-sm">{subtitle}</p>
        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="hero-stat-cta inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 px-4 py-2 text-sm font-medium text-primary"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
