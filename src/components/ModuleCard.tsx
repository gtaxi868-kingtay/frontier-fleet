import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: { label: string; value: string | number }[];
  link: string;
}

export function ModuleCard({ title, description, icon: Icon, stats, link }: ModuleCardProps) {
  return (
    <Link to={link} className="block group">
      <Card className="border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group-hover:scale-[1.02] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow group-hover:shadow-glow-gold transition-all duration-300 beveled">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display uppercase tracking-wide">{title}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground font-tactical">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 p-3 rounded-lg bg-muted/30 border border-primary/10 beveled">
                <p className="text-xs text-muted-foreground font-tactical font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 text-sm text-primary font-tactical font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 group-hover:text-gold transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
