import { LucideIcon } from "lucide-react";
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
    <Link to={link} className="block group module-card-link">
      <div
        className="glass-panel rounded-2xl p-5 hover:bg-white/[0.05] hover:border-primary/30 hover:-translate-y-0.5 relative overflow-hidden"
        style={{ transition: "transform 200ms var(--ease-out), border-color 200ms var(--ease-out), background-color 200ms var(--ease-out)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-primary/15 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold uppercase tracking-wide text-base text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-0.5 p-3 rounded-lg bg-black/20 border border-white/[0.06]">
              <p className="text-[11px] text-muted-foreground font-tactical font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 text-sm text-primary font-tactical font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          <span>View Details</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
