import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { ModuleCard } from "@/components/ModuleCard";
import { 
  Shield, 
  Package, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Crosshair,
  Wrench,
  HardHat,
  Truck,
  Flame,
  Shirt
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Battalion Command Center
              </h1>
              <p className="text-muted-foreground">
                Real-time inventory oversight for 1st Engineer Battalion
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Assets"
                value="2,847"
                subtitle="Across all modules"
                icon={Package}
                trend="up"
                trendValue="+12%"
                variant="default"
              />
              <StatCard
                title="Serviceable"
                value="94.2%"
                subtitle="Operational readiness"
                icon={CheckCircle2}
                trend="up"
                trendValue="+2.1%"
                variant="success"
              />
              <StatCard
                title="Pending Actions"
                value="23"
                subtitle="Requires approval"
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Critical Items"
                value="7"
                subtitle="Low stock alerts"
                icon={AlertTriangle}
                variant="danger"
              />
            </div>

            {/* Module Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Module Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ModuleCard
                  title="Weapons"
                  description="Small arms and heavy weapons inventory"
                  icon={Crosshair}
                  link="/weapons"
                  stats={[
                    { label: "Total", value: 284 },
                    { label: "Serviceable", value: "98%" },
                    { label: "Issued", value: 267 },
                    { label: "In Store", value: 17 },
                  ]}
                />
                <ModuleCard
                  title="Tools"
                  description="Hand tools and specialized equipment"
                  icon={Wrench}
                  link="/tools"
                  stats={[
                    { label: "Total", value: 892 },
                    { label: "Serviceable", value: "91%" },
                    { label: "Issued", value: 645 },
                    { label: "In Store", value: 247 },
                  ]}
                />
                <ModuleCard
                  title="Engineer Equipment"
                  description="Heavy construction and bridging gear"
                  icon={HardHat}
                  link="/engineer-equipment"
                  stats={[
                    { label: "Total", value: 156 },
                    { label: "Serviceable", value: "88%" },
                    { label: "Issued", value: 132 },
                    { label: "In Store", value: 24 },
                  ]}
                />
                <ModuleCard
                  title="Plant & Machinery"
                  description="Vehicles and heavy plant equipment"
                  icon={Truck}
                  link="/plant-machinery"
                  stats={[
                    { label: "Total", value: 47 },
                    { label: "Operational", value: "89%" },
                    { label: "Deployed", value: 38 },
                    { label: "Maintenance", value: 5 },
                  ]}
                />
                <ModuleCard
                  title="Explosives"
                  description="Controlled demolition and ammunition"
                  icon={Flame}
                  link="/explosives"
                  stats={[
                    { label: "Total Stock", value: "2.4T" },
                    { label: "Compliance", value: "100%" },
                    { label: "Issued YTD", value: "340kg" },
                    { label: "Storage", value: "Secure" },
                  ]}
                />
                <ModuleCard
                  title="Uniforms"
                  description="Personnel uniforms and tactical gear"
                  icon={Shirt}
                  link="/uniforms"
                  stats={[
                    { label: "Total", value: 1247 },
                    { label: "Serviceable", value: "96%" },
                    { label: "Issued", value: 1189 },
                    { label: "In Store", value: 58 },
                  ]}
                />
              </div>
            </div>
      </main>
    </div>
  );
};

export default Index;
