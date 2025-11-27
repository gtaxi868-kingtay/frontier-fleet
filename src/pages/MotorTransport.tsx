import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Wrench, Car, Building, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { AddMechanicsToolDialog } from "@/components/AddMechanicsToolDialog";
import { AddMTFacilityDialog } from "@/components/AddMTFacilityDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useInventoryData } from "@/hooks/useInventoryData";
import { RealtimeInventorySync } from "@/components/RealtimeInventorySync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MotorTransport() {
  const { role } = useAuth();
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const [toolSearchTerm, setToolSearchTerm] = useState('');
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; field: string; value: any; module: string } | null>(null);

  const canManage = role === 'S4' || role === 'S4_ADMIN' || role === 'SQMS' || role === 'STOREMAN';

  const vehiclesData = useInventoryData('vehicles');
  const toolsData = useInventoryData('mechanics_tools');
  const facilitiesData = useInventoryData('mt_facilities');

  const vehicles = vehiclesData.data || [];
  const tools = toolsData.data || [];
  const facilities = facilitiesData.data || [];

  const handleStatusChange = (id: string, field: string, newValue: any, module: string) => {
    setPendingUpdate({ id, field, value: newValue, module });
    setConfirmDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (pendingUpdate) {
      const updateFn = pendingUpdate.module === 'vehicles' ? vehiclesData.update :
                      pendingUpdate.module === 'mechanics_tools' ? toolsData.update :
                      facilitiesData.update;
      
      updateFn({
        id: pendingUpdate.id,
        updates: { [pendingUpdate.field]: pendingUpdate.value }
      });
    }
    setConfirmDialogOpen(false);
    setPendingUpdate(null);
  };

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
                      <Input 
                        placeholder="Search vehicles..." 
                        className="pl-9"
                        value={vehicleSearchTerm}
                        onChange={(e) => setVehicleSearchTerm(e.target.value)}
                      />
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
                {(() => {
                  const filteredVehicles = vehicles.filter(vehicle => {
                    const searchLower = vehicleSearchTerm.toLowerCase();
                    return (
                      vehicle.vehicle_id?.toLowerCase().includes(searchLower) ||
                      vehicle.vehicle_type?.toLowerCase().includes(searchLower) ||
                      vehicle.make_model?.toLowerCase().includes(searchLower) ||
                      vehicle.registration_number?.toLowerCase().includes(searchLower)
                    );
                  });
                  
                  return filteredVehicles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {vehicleSearchTerm ? "No vehicles match your search." : "No vehicles registered. Add vehicles to track fleet inventory and fuel consumption."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVehicles.map((vehicle) => (
                      <Card 
                        key={vehicle.id} 
                        className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50"
                        onClick={() => {
                          setSelectedItem(vehicle);
                          setDetailTitle(`${vehicle.vehicle_id} - ${vehicle.vehicle_type}`);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg font-display uppercase tracking-wider">
                            {vehicle.vehicle_id}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{vehicle.vehicle_type}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Model</span>
                            <span className="font-medium text-xs">{vehicle.make_model}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Reg</span>
                            <span className="font-medium">{vehicle.registration_number}</span>
                          </div>
                          {vehicle.location && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-tactical uppercase text-muted-foreground">Location</span>
                              <span className="font-medium">{vehicle.location}</span>
                            </div>
                          )}
                          <div className="pt-2 flex items-center gap-2">
                            {canManage ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-auto p-0 w-full">
                                    <Badge variant={vehicle.serviceability === 'Serviceable' ? 'default' : 'destructive'} className="w-full justify-center cursor-pointer hover:opacity-80">
                                      {vehicle.serviceability}
                                      <MoreVertical className="ml-2 h-3 w-3" />
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(vehicle.id, 'serviceability', 'Serviceable', 'vehicles'); }}>
                                    Mark as Serviceable
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(vehicle.id, 'serviceability', 'Unserviceable', 'vehicles'); }}>
                                    Mark as Unserviceable
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(vehicle.id, 'serviceability', 'Under Repair', 'vehicles'); }}>
                                    Mark as Under Repair
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Badge variant={vehicle.serviceability === 'Serviceable' ? 'default' : 'destructive'} className="w-full justify-center">
                                {vehicle.serviceability}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  );
                })()}
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
                      <Input 
                        placeholder="Search tools..." 
                        className="pl-9"
                        value={toolSearchTerm}
                        onChange={(e) => setToolSearchTerm(e.target.value)}
                      />
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
                {(() => {
                  const filteredTools = tools.filter(tool => {
                    const searchLower = toolSearchTerm.toLowerCase();
                    return (
                      tool.tool_id?.toLowerCase().includes(searchLower) ||
                      tool.tool_name?.toLowerCase().includes(searchLower) ||
                      tool.category?.toLowerCase().includes(searchLower)
                    );
                  });
                  
                  return filteredTools.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {toolSearchTerm ? "No tools match your search." : "No tools registered. Add mechanics tools to track specialized equipment."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTools.map((tool) => (
                      <Card 
                        key={tool.id} 
                        className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-accent/50"
                        onClick={() => {
                          setSelectedItem(tool);
                          setDetailTitle(`${tool.tool_id} - ${tool.tool_name}`);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg font-display uppercase tracking-wider">
                            {tool.tool_id}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{tool.tool_name}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Category</span>
                            <span className="font-medium">{tool.category}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                            <span className="font-medium">{tool.qty_on_hand}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Issued</span>
                            <span className="font-medium">{tool.qty_issued}</span>
                          </div>
                          <div className="pt-2">
                            {canManage ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-auto p-0 w-full">
                                    <Badge variant={tool.serviceable ? 'default' : 'destructive'} className="w-full justify-center cursor-pointer hover:opacity-80">
                                      {tool.serviceable ? 'Serviceable' : 'Unserviceable'}
                                      <MoreVertical className="ml-2 h-3 w-3" />
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(tool.id, 'serviceable', true, 'mechanics_tools'); }}>
                                    Mark as Serviceable
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(tool.id, 'serviceable', false, 'mechanics_tools'); }}>
                                    Mark as Unserviceable
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Badge variant={tool.serviceable ? 'default' : 'destructive'} className="w-full justify-center">
                                {tool.serviceable ? 'Serviceable' : 'Unserviceable'}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  );
                })()}
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
                      <Input 
                        placeholder="Search facilities..." 
                        className="pl-9"
                        value={facilitySearchTerm}
                        onChange={(e) => setFacilitySearchTerm(e.target.value)}
                      />
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
                {(() => {
                  const filteredFacilities = facilities.filter(facility => {
                    const searchLower = facilitySearchTerm.toLowerCase();
                    return (
                      facility.facility_id?.toLowerCase().includes(searchLower) ||
                      facility.facility_name?.toLowerCase().includes(searchLower) ||
                      facility.facility_type?.toLowerCase().includes(searchLower) ||
                      facility.location?.toLowerCase().includes(searchLower)
                    );
                  });
                  
                  return filteredFacilities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {facilitySearchTerm ? "No facilities match your search." : "No facilities registered. Add workshops and maintenance areas to track MT spaces."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFacilities.map((facility) => (
                      <Card 
                        key={facility.id} 
                        className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-secondary/50"
                        onClick={() => {
                          setSelectedItem(facility);
                          setDetailTitle(`${facility.facility_id} - ${facility.facility_name}`);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg font-display uppercase tracking-wider">
                            {facility.facility_id}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{facility.facility_name}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Type</span>
                            <span className="font-medium">{facility.facility_type}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-tactical uppercase text-muted-foreground">Location</span>
                            <span className="font-medium">{facility.location || 'Not specified'}</span>
                          </div>
                          {facility.capacity && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-tactical uppercase text-muted-foreground">Capacity</span>
                              <span className="font-medium">{facility.capacity}</span>
                            </div>
                          )}
                          <div className="pt-2">
                            {canManage ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-auto p-0 w-full">
                                    <Badge variant={facility.status === 'Operational' ? 'default' : 'destructive'} className="w-full justify-center cursor-pointer hover:opacity-80">
                                      {facility.status}
                                      <MoreVertical className="ml-2 h-3 w-3" />
                                    </Badge>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(facility.id, 'status', 'Operational', 'mt_facilities'); }}>
                                    Mark as Operational
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(facility.id, 'status', 'Under Maintenance', 'mt_facilities'); }}>
                                    Mark as Under Maintenance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(facility.id, 'status', 'Closed', 'mt_facilities'); }}>
                                    Mark as Closed
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Badge variant={facility.status === 'Operational' ? 'default' : 'destructive'} className="w-full justify-center">
                                {facility.status}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddVehicleDialog 
        open={vehicleDialogOpen} 
        onOpenChange={setVehicleDialogOpen}
        onSuccess={() => vehiclesData.refetch()}
      />
      <AddMechanicsToolDialog 
        open={toolDialogOpen} 
        onOpenChange={setToolDialogOpen}
        onSuccess={() => toolsData.refetch()}
      />
      <AddMTFacilityDialog 
        open={facilityDialogOpen} 
        onOpenChange={setFacilityDialogOpen}
        onSuccess={() => facilitiesData.refetch()}
      />
      
      <ItemDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={detailTitle}
        data={selectedItem}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        description={`Are you sure you want to update this item's status? This action will be logged in the audit trail.`}
      />

      <RealtimeInventorySync module="vehicles" onDataChange={() => vehiclesData.refetch()} />
      <RealtimeInventorySync module="mechanics_tools" onDataChange={() => toolsData.refetch()} />
      <RealtimeInventorySync module="mt_facilities" onDataChange={() => facilitiesData.refetch()} />
    </div>
  );
}
