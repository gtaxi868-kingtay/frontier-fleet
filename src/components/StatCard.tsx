import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: "border-primary/20 bg-gradient-to-br from-card to-background",
    success: "border-success/30 bg-gradient-to-br from-success/10 to-background",
    warning: "border-warning/30 bg-gradient-to-br from-warning/10 to-background",
    danger: "border-destructive/30 bg-gradient-to-br from-destructive/10 to-background",
  };

  const iconStyles = {
    default: "bg-gradient-primary text-primary-foreground shadow-glow",
    success: "bg-success text-success-foreground shadow-md",
    warning: "bg-warning text-warning-foreground shadow-md",
    danger: "bg-destructive text-destructive-foreground shadow-md",
  };

  return (
    <Card className={`${variantStyles[variant]} border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 command-border`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-tactical font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-accent">{value}</h3>
              {trendValue && (
                <span
                  className={`text-sm font-tactical font-bold uppercase tracking-wide ${
                    trend === "up"
                      ? "text-success"
                      : trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-tactical">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconStyles[variant]} beveled`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
