import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { ModuleCard } from "@/components/ModuleCard";
import { ActionRequiredCard } from "@/components/ActionRequiredCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
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
  Shirt,
  Building,
  Hammer,
  Boxes,
  Car
} from "lucide-react";

interface DashboardStats {
  totalAssets: number;
  serviceablePercentage: number;
  pendingActions: number;
  criticalItems: number;
}

interface ModuleStats {
  weapons: { total: number; serviceable: number; issued: number; inStore: number };
  tools: { total: number; serviceable: number; issued: number; inStore: number };
  engineerEquipment: { total: number; serviceable: number; issued: number; inStore: number };
  plantMachinery: { total: number; operational: number; deployed: number; maintenance: number };
  motorTransport: { vehicles: number; serviceable: number; tools: number; facilities: number };
  explosives: { totalStock: string; compliance: string; issuedYTD: string; storage: string };
  uniforms: { total: number; serviceable: number; issued: number; inStore: number };
  ppe: { total: number; serviceable: number; issued: number; inStore: number };
  facilities: { total: number; working: number; inspected: number; pending: number };
  worksMaterials: { projects: number; materials: number; issued: string; active: number };
  generalInventory: { categories: number; items: number; stockLevel: string; lowStock: number };
  roomInventory: { rooms: number; compliant: string; inspected: number; overdue: number };
}

const Index = () => {
  const { applyUnitFilter, canSeeAllUnits, userUnitId } = useUnitFilter();
  const { profile, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unitName, setUnitName] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAssets: 0,
    serviceablePercentage: 0,
    pendingActions: 0,
    criticalItems: 0,
  });
  const [moduleStats, setModuleStats] = useState<ModuleStats>({
    weapons: { total: 0, serviceable: 0, issued: 0, inStore: 0 },
    tools: { total: 0, serviceable: 0, issued: 0, inStore: 0 },
    engineerEquipment: { total: 0, serviceable: 0, issued: 0, inStore: 0 },
    plantMachinery: { total: 0, operational: 0, deployed: 0, maintenance: 0 },
    motorTransport: { vehicles: 0, serviceable: 0, tools: 0, facilities: 0 },
    explosives: { totalStock: "0", compliance: "100%", issuedYTD: "0", storage: "Secure" },
    uniforms: { total: 0, serviceable: 0, issued: 0, inStore: 0 },
    ppe: { total: 0, serviceable: 0, issued: 0, inStore: 0 },
    facilities: { total: 0, working: 0, inspected: 0, pending: 0 },
    worksMaterials: { projects: 0, materials: 0, issued: "0", active: 0 },
    generalInventory: { categories: 0, items: 0, stockLevel: "0%", lowStock: 0 },
    roomInventory: { rooms: 0, compliant: "0%", inspected: 0, overdue: 0 },
  });

  useEffect(() => {
    fetchDashboardData();
    if (profile?.unit_id && !canSeeAllUnits) {
      // Fetch unit name for display
      supabase
        .from('units')
        .select('name')
        .eq('id', profile.unit_id)
        .single()
        .then(({ data }) => {
          if (data) setUnitName(data.name);
        });
    } else {
      setUnitName(null);
    }
  }, [userUnitId, canSeeAllUnits, profile?.unit_id]);

  const fetchDashboardData = async () => {
    try {
      // Helper function to apply unit filter to queries
      const getUnitFilteredQuery = (tableName: string, unitColumn: string = 'squadron_id') => {
        let query = supabase.from(tableName).select('*');
        if (!canSeeAllUnits && userUnitId) {
          query = query.eq(unitColumn, userUnitId);
        }
        return query;
      };

      // Fetch weapons data
      const { data: weapons } = await getUnitFilteredQuery('weapons');
      const weaponsTotal = weapons?.length || 0;
      const weaponsServiceable = weapons?.filter(w => w.serviceable).length || 0;
      const weaponsIssued = weapons?.filter(w => w.issued_to).length || 0;

      // Fetch tools data
      const { data: tools } = await getUnitFilteredQuery('tools');
      const toolsTotal = tools?.reduce((sum, t) => sum + (t.qty_on_hand || 0), 0) || 0;
      const toolsIssued = tools?.reduce((sum, t) => sum + (t.qty_issued || 0), 0) || 0;
      const toolsServiceable = tools?.filter(t => t.serviceable).length || 0;

      // Fetch engineer equipment
      const { data: engineerEquip } = await getUnitFilteredQuery('engineer_equipment');
      const engineerTotal = engineerEquip?.reduce((sum, e) => sum + (e.qty_on_hand || 0), 0) || 0;
      const engineerIssued = engineerEquip?.reduce((sum, e) => sum + (e.qty_issued || 0), 0) || 0;
      const engineerServiceable = engineerEquip?.filter(e => e.serviceable).length || 0;

      // Fetch plant machinery
      const { data: plantMachinery } = await getUnitFilteredQuery('plant_machinery');
      const plantTotal = plantMachinery?.length || 0;
      const plantOperational = plantMachinery?.filter(p => p.serviceability === 'Serviceable').length || 0;
      const plantDeployed = plantMachinery?.filter(p => p.operator_assigned).length || 0;

      // Fetch motor transport
      const { data: vehicles } = await getUnitFilteredQuery('vehicles');
      const { data: mechanicsTools } = await getUnitFilteredQuery('mechanics_tools');
      const { data: mtFacilities } = await getUnitFilteredQuery('mt_facilities');
      const vehiclesTotal = vehicles?.length || 0;
      const vehiclesServiceable = vehicles?.filter(v => v.serviceability === 'Serviceable').length || 0;
      const mechanicsToolsTotal = mechanicsTools?.reduce((sum, t) => sum + (t.qty_on_hand || 0), 0) || 0;
      const mtFacilitiesTotal = mtFacilities?.length || 0;

      // Fetch explosives
      const { data: explosives } = await getUnitFilteredQuery('explosives');
      const explosivesTotal = explosives?.reduce((sum, e) => sum + (e.quantity_received || 0), 0) || 0;
      const explosivesIssued = explosives?.reduce((sum, e) => sum + (e.quantity_issued || 0), 0) || 0;

      // Fetch uniforms
      const { data: uniforms } = await getUnitFilteredQuery('uniforms');
      const uniformsTotal = uniforms?.length || 0;
      const uniformsServiceable = uniforms?.filter(u => u.serviceable).length || 0;
      const uniformsIssued = uniforms?.filter(u => u.issued_to).length || 0;

      // Fetch PPE
      const { data: ppe } = await getUnitFilteredQuery('ppe');
      const ppeTotal = ppe?.reduce((sum, p) => sum + (p.qty_on_hand || 0), 0) || 0;
      const ppeIssued = ppe?.reduce((sum, p) => sum + (p.qty_issued || 0), 0) || 0;
      const ppeServiceable = ppe?.filter(p => p.serviceable).length || 0;

      // Fetch facilities
      const { data: facilities } = await getUnitFilteredQuery('facilities');
      const facilitiesTotal = facilities?.reduce((sum, f) => sum + (f.quantity || 0), 0) || 0;
      const facilitiesWorking = facilities?.reduce((sum, f) => sum + (f.working || 0), 0) || 0;
      const facilitiesInspected = facilities?.filter(f => f.last_inspection).length || 0;

      // Fetch works materials
      const { data: worksMaterials } = await getUnitFilteredQuery('works_materials', 'unit_id');
      const worksMaterialsTotal = worksMaterials?.length || 0;
      const worksMaterialsIssued = worksMaterials?.reduce((sum, w) => sum + (w.quantity_issued || 0), 0) || 0;

      // Fetch general inventory
      const { data: generalInventory } = await getUnitFilteredQuery('general_inventory');
      const generalInventoryTotal = generalInventory?.reduce((sum, g) => sum + (g.qty_on_hand || 0), 0) || 0;
      const generalInventoryLowStock = generalInventory?.filter(g => (g.qty_on_hand || 0) <= (g.reorder_level || 0)).length || 0;

      // Fetch room inventory (may not have unit column, skip filter for now)
      const { data: roomInventory } = await supabase.from('room_inventory').select('*');
      const roomsTotal = roomInventory?.length || 0;
      const roomsCompliant = roomInventory?.filter(r => (r.present_qty || 0) >= (r.expected_qty || 0)).length || 0;
      const roomsInspected = roomInventory?.filter(r => r.inspection_date).length || 0;

      // Calculate total assets
      const totalAssets = weaponsTotal + toolsTotal + engineerTotal + plantTotal + vehiclesTotal + 
                         uniformsTotal + ppeTotal + facilitiesTotal + generalInventoryTotal + roomsTotal;

      // Calculate serviceable percentage
      const totalServiceableItems = weaponsServiceable + toolsServiceable + engineerServiceable + 
                                    plantOperational + vehiclesServiceable + uniformsServiceable + ppeServiceable;
      const totalCheckableItems = weaponsTotal + tools?.length || 0 + engineerEquip?.length || 0 + 
                                 plantTotal + vehiclesTotal + uniformsTotal + ppe?.length || 0;
      const serviceablePercentage = totalCheckableItems > 0 
        ? Math.round((totalServiceableItems / totalCheckableItems) * 100) 
        : 0;

      // Set dashboard stats
      setDashboardStats({
        totalAssets,
        serviceablePercentage,
        pendingActions: 0, // Would need to query alerts or pending approvals
        criticalItems: generalInventoryLowStock,
      });

      // Set module stats
      setModuleStats({
        weapons: {
          total: weaponsTotal,
          serviceable: weaponsServiceable,
          issued: weaponsIssued,
          inStore: weaponsTotal - weaponsIssued,
        },
        tools: {
          total: toolsTotal,
          serviceable: toolsServiceable,
          issued: toolsIssued,
          inStore: toolsTotal - toolsIssued,
        },
        engineerEquipment: {
          total: engineerTotal,
          serviceable: engineerServiceable,
          issued: engineerIssued,
          inStore: engineerTotal - engineerIssued,
        },
        plantMachinery: {
          total: plantTotal,
          operational: plantOperational,
          deployed: plantDeployed,
          maintenance: plantTotal - plantOperational,
        },
        motorTransport: {
          vehicles: vehiclesTotal,
          serviceable: vehiclesServiceable,
          tools: mechanicsToolsTotal,
          facilities: mtFacilitiesTotal,
        },
        explosives: {
          totalStock: `${(explosivesTotal / 1000).toFixed(1)}T`,
          compliance: "100%",
          issuedYTD: `${explosivesIssued}kg`,
          storage: "Secure",
        },
        uniforms: {
          total: uniformsTotal,
          serviceable: uniformsServiceable,
          issued: uniformsIssued,
          inStore: uniformsTotal - uniformsIssued,
        },
        ppe: {
          total: ppeTotal,
          serviceable: ppeServiceable,
          issued: ppeIssued,
          inStore: ppeTotal - ppeIssued,
        },
        facilities: {
          total: facilitiesTotal,
          working: facilitiesWorking,
          inspected: facilitiesInspected,
          pending: (facilities?.length || 0) - facilitiesInspected,
        },
        worksMaterials: {
          projects: worksMaterialsTotal,
          materials: worksMaterialsTotal,
          issued: `${(worksMaterialsIssued / 1000).toFixed(1)}T`,
          active: worksMaterialsTotal,
        },
        generalInventory: {
          categories: new Set(generalInventory?.map(g => g.category)).size,
          items: generalInventoryTotal,
          stockLevel: totalCheckableItems > 0 ? `${Math.round((generalInventoryTotal / totalCheckableItems) * 100)}%` : "0%",
          lowStock: generalInventoryLowStock,
        },
        roomInventory: {
          rooms: roomsTotal,
          compliant: roomsTotal > 0 ? `${Math.round((roomsCompliant / roomsTotal) * 100)}%` : "0%",
          inspected: roomsInspected,
          overdue: roomsTotal - roomsInspected,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {canSeeAllUnits ? 'Battalion Command Center' : (profile?.unit_id ? 'Unit Dashboard' : 'Dashboard')}
            </h1>
            {!canSeeAllUnits && unitName && (
              <Badge variant="outline" className="text-sm">
                {unitName}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {canSeeAllUnits 
              ? 'Real-time inventory oversight for 1st Engineer Battalion'
              : 'Real-time inventory oversight for your unit'
            }
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Assets"
            value={loading ? "..." : dashboardStats.totalAssets.toLocaleString()}
            subtitle="Across all modules"
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Serviceable"
            value={loading ? "..." : `${dashboardStats.serviceablePercentage}%`}
            subtitle="Operational readiness"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Pending Actions"
            value={loading ? "..." : dashboardStats.pendingActions}
            subtitle="Requires approval"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Critical Items"
            value={loading ? "..." : dashboardStats.criticalItems}
            subtitle="Low stock alerts"
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Action Required Card */}
        <ActionRequiredCard />

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
                { label: "Total", value: moduleStats.weapons.total },
                { label: "Serviceable", value: `${moduleStats.weapons.serviceable}` },
                { label: "Issued", value: moduleStats.weapons.issued },
                { label: "In Store", value: moduleStats.weapons.inStore },
              ]}
            />
            <ModuleCard
              title="Tools"
              description="Hand tools and specialized equipment"
              icon={Wrench}
              link="/tools"
              stats={[
                { label: "Total", value: moduleStats.tools.total },
                { label: "Serviceable", value: `${moduleStats.tools.serviceable}` },
                { label: "Issued", value: moduleStats.tools.issued },
                { label: "In Store", value: moduleStats.tools.inStore },
              ]}
            />
            <ModuleCard
              title="Engineer Equipment"
              description="Heavy construction and bridging gear"
              icon={HardHat}
              link="/engineer-equipment"
              stats={[
                { label: "Total", value: moduleStats.engineerEquipment.total },
                { label: "Serviceable", value: `${moduleStats.engineerEquipment.serviceable}` },
                { label: "Issued", value: moduleStats.engineerEquipment.issued },
                { label: "In Store", value: moduleStats.engineerEquipment.inStore },
              ]}
            />
            <ModuleCard
              title="Plant & Machinery"
              description="Vehicles and heavy plant equipment"
              icon={Truck}
              link="/plant-machinery"
              stats={[
                { label: "Total", value: moduleStats.plantMachinery.total },
                { label: "Operational", value: `${moduleStats.plantMachinery.operational}` },
                { label: "Deployed", value: moduleStats.plantMachinery.deployed },
                { label: "Maintenance", value: moduleStats.plantMachinery.maintenance },
              ]}
            />
            <ModuleCard
              title="Motor Transport"
              description="MT department vehicles, tools, and workshops"
              icon={Car}
              link="/motor-transport"
              stats={[
                { label: "Vehicles", value: moduleStats.motorTransport.vehicles },
                { label: "Serviceable", value: `${moduleStats.motorTransport.serviceable}` },
                { label: "Tools", value: moduleStats.motorTransport.tools },
                { label: "Facilities", value: moduleStats.motorTransport.facilities },
              ]}
            />
            <ModuleCard
              title="Explosives"
              description="Controlled demolition and ammunition"
              icon={Flame}
              link="/explosives"
              stats={[
                { label: "Total Stock", value: moduleStats.explosives.totalStock },
                { label: "Compliance", value: moduleStats.explosives.compliance },
                { label: "Issued YTD", value: moduleStats.explosives.issuedYTD },
                { label: "Storage", value: moduleStats.explosives.storage },
              ]}
            />
            <ModuleCard
              title="Uniforms"
              description="Personnel uniforms and tactical gear"
              icon={Shirt}
              link="/uniforms"
              stats={[
                { label: "Total", value: moduleStats.uniforms.total },
                { label: "Serviceable", value: `${moduleStats.uniforms.serviceable}` },
                { label: "Issued", value: moduleStats.uniforms.issued },
                { label: "In Store", value: moduleStats.uniforms.inStore },
              ]}
            />
            <ModuleCard
              title="PPE"
              description="Personal protective equipment"
              icon={Shield}
              link="/ppe"
              stats={[
                { label: "Total", value: moduleStats.ppe.total },
                { label: "Serviceable", value: `${moduleStats.ppe.serviceable}` },
                { label: "Issued", value: moduleStats.ppe.issued },
                { label: "In Store", value: moduleStats.ppe.inStore },
              ]}
            />
            <ModuleCard
              title="Facilities"
              description="Infrastructure and base facilities"
              icon={Building}
              link="/facilities"
              stats={[
                { label: "Total", value: moduleStats.facilities.total },
                { label: "Working", value: `${moduleStats.facilities.working}` },
                { label: "Inspected", value: moduleStats.facilities.inspected },
                { label: "Pending", value: moduleStats.facilities.pending },
              ]}
            />
            <ModuleCard
              title="Works Materials"
              description="Construction and project materials"
              icon={Hammer}
              link="/works-materials"
              stats={[
                { label: "Projects", value: moduleStats.worksMaterials.projects },
                { label: "Materials", value: moduleStats.worksMaterials.materials },
                { label: "Issued", value: moduleStats.worksMaterials.issued },
                { label: "Active", value: moduleStats.worksMaterials.active },
              ]}
            />
            <ModuleCard
              title="General Inventory"
              description="Miscellaneous stores and supplies"
              icon={Boxes}
              link="/inventory"
              stats={[
                { label: "Categories", value: moduleStats.generalInventory.categories },
                { label: "Items", value: moduleStats.generalInventory.items },
                { label: "Stock Level", value: moduleStats.generalInventory.stockLevel },
                { label: "Low Stock", value: moduleStats.generalInventory.lowStock },
              ]}
            />
            <ModuleCard
              title="Room Inventory"
              description="Barrack and facility room checks"
              icon={Building}
              link="/room-inventory"
              stats={[
                { label: "Rooms", value: moduleStats.roomInventory.rooms },
                { label: "Compliant", value: moduleStats.roomInventory.compliant },
                { label: "Inspected", value: moduleStats.roomInventory.inspected },
                { label: "Overdue", value: moduleStats.roomInventory.overdue },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;