import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Wrench, Car, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { AddMechanicsToolDialog } from "@/components/AddMechanicsToolDialog";
import { AddMTFacilityDialog } from "@/components/AddMTFacilityDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function MotorTransport() {
  const { role } = useAuth();
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  const canManage = role === 'S4' || role === 'SQMS';

  const fetchData = async () => {
    const [vehiclesRes, toolsRes, facilitiesRes] = await Promise.all([
      supabase.from("vehicles").select("*"),
      supabase.from("mechanics_tools").select("*"),
      supabase.from("mt_facilities").select("*"),
    ]);

    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    if (toolsRes.data) setTools(toolsRes.data);
    if (facilitiesRes.data) setFacilities(facilitiesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const serviceableVehicles = vehicles.filter(v => v.serviceability === 'Serviceable').length;
  const serviceableTools = tools.filter(t => t.serviceable).length;
  const operationalFacilities = facilities.filter(f => f.status === 'Operational').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Motor Transport (MT) Department
            </h1>
            <p className="text-muted-foreground mt-1">
              Vehicles, mechanics' tools, and maintenance facilities management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-primary" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviceable:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">{serviceableVehicles}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unserviceable:</span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{vehicles.length - serviceableVehicles}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Vehicles:</span>
                  <Badge variant="outline">{vehicles.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-accent" />
                Mechanics Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools On Hand:</span>
                  <Badge variant="outline">{tools.reduce((sum, t) => sum + t.qty_on_hand, 0)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools Issued:</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">{tools.reduce((sum, t) => sum + t.qty_issued, 0)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviceable:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">{serviceableTools}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-secondary" />
                Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Facilities:</span>
                  <Badge variant="outline">{facilities.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operational:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">{operationalFacilities}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maintenance Due:</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">{facilities.length - operationalFacilities}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="tools">Mechanics Tools</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Fleet Inventory</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search vehicles..." className="pl-9" />
                    </div>
{canManage && (
                      <div className="flex gap-2">
                        {role === 'S4' && <BulkUploadDialog module="vehicles" moduleName="Vehicles" />}
                        <Button variant="default" className="gap-2" onClick={() => setVehicleDialogOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Add Vehicle
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No vehicles registered. Add vehicles to track fleet inventory and fuel consumption.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{vehicle.vehicle_id} - {vehicle.vehicle_type}</h3>
                            <p className="text-sm text-muted-foreground">{vehicle.make_model}</p>
                            <p className="text-sm">Reg: {vehicle.registration_number}</p>
                            {vehicle.location && <p className="text-sm text-muted-foreground">Location: {vehicle.location}</p>}
                          </div>
                          <Badge variant={vehicle.serviceability === 'Serviceable' ? 'default' : 'destructive'}>
                            {vehicle.serviceability}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mechanics Tools Inventory</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search tools..." className="pl-9" />
                    </div>
{canManage && (
                      <div className="flex gap-2">
                        {role === 'S4' && <BulkUploadDialog module="mechanics_tools" moduleName="Mechanics Tools" />}
                        <Button variant="default" className="gap-2" onClick={() => setToolDialogOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Add Tool
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tools.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tools registered. Add mechanics tools to track specialized equipment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div key={tool.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{tool.tool_id} - {tool.tool_name}</h3>
                            <p className="text-sm text-muted-foreground">{tool.category}</p>
                            <p className="text-sm">Qty on Hand: {tool.qty_on_hand} | Issued: {tool.qty_issued}</p>
                          </div>
                          <Badge variant={tool.serviceable ? 'default' : 'destructive'}>
                            {tool.serviceable ? 'Serviceable' : 'Unserviceable'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MT Facilities</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search facilities..." className="pl-9" />
                    </div>
{canManage && (
                      <div className="flex gap-2">
                        {role === 'S4' && <BulkUploadDialog module="mt_facilities" moduleName="MT Facilities" />}
                        <Button variant="default" className="gap-2" onClick={() => setFacilityDialogOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Add Facility
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facilities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No facilities registered. Add workshops and maintenance areas to track MT spaces.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{facility.facility_id} - {facility.facility_name}</h3>
                            <p className="text-sm text-muted-foreground">{facility.facility_type}</p>
                            <p className="text-sm">Location: {facility.location || 'Not specified'}</p>
                            {facility.capacity && <p className="text-sm text-muted-foreground">Capacity: {facility.capacity}</p>}
                          </div>
                          <Badge variant={facility.status === 'Operational' ? 'default' : 'destructive'}>
                            {facility.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddVehicleDialog 
        open={vehicleDialogOpen} 
        onOpenChange={setVehicleDialogOpen}
        onSuccess={fetchData}
      />
      <AddMechanicsToolDialog 
        open={toolDialogOpen} 
        onOpenChange={setToolDialogOpen}
        onSuccess={fetchData}
      />
      <AddMTFacilityDialog 
        open={facilityDialogOpen} 
        onOpenChange={setFacilityDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
