import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="border border-primary/30 bg-card shadow-glow overflow-hidden relative rounded-lg">
      <div className="absolute inset-0 fuel-tank-grid opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-primary" />
      <CardContent className="p-8 relative space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-[0.15em] text-primary">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        {loading ? (
          <div className="h-14 w-32 rounded-md bg-muted animate-pulse" />
        ) : (
          <div className="text-6xl font-display font-black tracking-tight text-foreground">{value}</div>
        )}
        <p className="text-muted-foreground text-sm">{subtitle}</p>
        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="hero-stat-cta inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 px-4 py-2 text-sm font-medium text-primary"
          >
            {actionLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
