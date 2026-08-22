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
}

export function HeroStatCard({ label, value, subtitle, icon: Icon, actionLabel, actionLink }: HeroStatCardProps) {
  return (
    <Card className="border-0 bg-gradient-hero text-primary-foreground shadow-glow overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_60%)]" />
      <CardContent className="p-8 relative space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="text-5xl font-bold tracking-tight">{value}</div>
        <p className="text-primary-foreground/75 text-sm">{subtitle}</p>
        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
