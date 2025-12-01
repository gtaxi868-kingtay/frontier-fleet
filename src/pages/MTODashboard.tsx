import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, Wrench, Fuel, AlertTriangle, CheckCircle2, Calendar, FileText, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MTWorkTicketDialog } from "@/components/MTWorkTicketDialog";
import { MTDriverPermitDialog } from "@/components/MTDriverPermitDialog";
import { WorkTicketReturnDialog } from "@/components/WorkTicketReturnDialog";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function MTODashboard() {
  const { role, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workTicketDialogOpen, setWorkTicketDialogOpen] = useState(false);
  const [workTicketReturnDialogOpen, setWorkTicketReturnDialogOpen] = useState(false);
  const [selectedTicketForReturn, setSelectedTicketForReturn] = useState<any>(null);
  const [driverPermitDialogOpen, setDriverPermitDialogOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    serviceableVehicles: 0,
    allocatedVehicles: 0,
    availableVehicles: 0,
    activeWorkTickets: 0,
    activeDrivers: 0,
    driversWithPermits: 0,
    pendingInspections: 0,
    pendingAccidents: 0,
    totalPOLConsumption: 0,
  });

  // Check if user is MTO or has access
  const isMTO = role === 'MTO' || role === 'S4' || role === 'CO' || role === 'S4_ADMIN';
  
  // Fetch work tickets
  const { data: workTickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ['mt_work_tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mt_work_tickets')
        .select(`
          *,
          vehicle:vehicles(vehicle_id, vehicle_type),
          driver:profiles!mt_work_tickets_driver_id_fkey(name, rank)
        `)
        .order('issue_date', { ascending: false })
        .order('issue_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isMTO,
  });

  // Fetch driver permits
  const { data: driverPermits = [], refetch: refetchPermits } = useQuery({
    queryKey: ['mt_driver_permits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mt_driver_permits')
        .select(`
          *,
          driver:profiles!mt_driver_permits_driver_id_fkey(name, rank)
        `)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isMTO,
  });
  
  useEffect(() => {
    if (!isMTO) return;
    fetchMTStats();
  }, [isMTO]);

  const fetchMTStats = async () => {
    setLoading(true);
    try {
      // Fetch vehicles
      const { data: vehicles } = await supabase.from('vehicles').select('*');
      const totalVehicles = vehicles?.length || 0;
      const serviceableVehicles = vehicles?.filter(v => v.serviceability === 'Serviceable').length || 0;

      // Fetch vehicle allocations
      const { data: allocations } = await supabase.from('mt_vehicle_allocations').select('*');
      const allocatedVehicles = allocations?.length || 0;
      const availableVehicles = totalVehicles - allocatedVehicles;

      // Fetch active work tickets
      const { data: workTickets } = await supabase
        .from('mt_work_tickets')
        .select('*')
        .eq('status', 'active');
      const activeWorkTickets = workTickets?.length || 0;

      // Fetch driver permits
      const { data: permits } = await supabase
        .from('mt_driver_permits')
        .select('*')
        .eq('status', 'active');
      const driversWithPermits = permits?.length || 0;

      // Fetch pending inspections
      const { data: inspections } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .is('next_inspection_due', null)
        .or('next_inspection_due.lte.' + new Date().toISOString().split('T')[0]);
      const pendingInspections = inspections?.length || 0;

      // Fetch pending accidents
      const { data: accidents } = await supabase
        .from('mt_accidents')
        .select('*')
        .in('status', ['reported', 'investigating']);
      const pendingAccidents = accidents?.length || 0;

      // Fetch POL consumption (this month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: polAccounts } = await supabase
        .from('pol_accounts')
        .select('petrol_issued')
        .gte('account_period_month', currentMonth + '-01');
      const totalPOLConsumption = polAccounts?.reduce((sum, account) => sum + (parseFloat(account.petrol_issued) || 0), 0) || 0;

      setStats({
        totalVehicles,
        serviceableVehicles,
        allocatedVehicles,
        availableVehicles,
        activeWorkTickets,
        activeDrivers: driversWithPermits, // Active drivers with permits
        driversWithPermits,
        pendingInspections,
        pendingAccidents,
        totalPOLConsumption: Math.round(totalPOLConsumption),
      });
    } catch (error) {
      console.error('Error fetching MT stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMTO) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need MTO role to access this dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Motor Transport Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Vehicle pool management, driver administration, and POL tracking
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">In fleet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Serviceable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : stats.serviceableVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{loading ? "..." : stats.availableVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">In pool</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.activeWorkTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">Work tickets</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.driversWithPermits}</div>
              <p className="text-xs text-muted-foreground mt-1">With active permits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Pending Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inspections Due</span>
                  <Badge variant="outline">{loading ? "..." : stats.pendingInspections}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accidents</span>
                  <Badge variant="destructive">{loading ? "..." : stats.pendingAccidents}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                POL Consumption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalPOLConsumption}</div>
              <p className="text-xs text-muted-foreground mt-1">Litres this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common MT management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setWorkTicketDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Work Ticket
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Generate MT Detail
              </Button>
              <Button variant="outline" className="justify-start">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Schedule Inspection
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => {
                  setSelectedPermit(null);
                  setDriverPermitDialogOpen(true);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Drivers
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="work-tickets">Work Tickets</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="pol">POL Management</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>MT Operations Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed overview coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Pool Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Vehicle management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="work-tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Work Tickets</CardTitle>
                    <CardDescription>Manage vehicle assignments and journey tracking</CardDescription>
                  </div>
                  <Button onClick={() => setWorkTicketDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Work Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workTickets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No work tickets found. Create one to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket #</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workTickets.map((ticket: any) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                          <TableCell>
                            {ticket.vehicle?.vehicle_id || 'N/A'} - {ticket.vehicle?.vehicle_type || ''}
                          </TableCell>
                          <TableCell>
                            {ticket.driver?.rank || ''} {ticket.driver?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{ticket.destination}</TableCell>
                          <TableCell>
                            {ticket.issue_date ? format(new Date(ticket.issue_date), 'MMM dd, yyyy') : 'N/A'}
                            {ticket.issue_time && ` at ${ticket.issue_time}`}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={ticket.status === 'active' ? 'default' : ticket.status === 'completed' ? 'secondary' : 'outline'}
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {ticket.status === 'active' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTicketForReturn(ticket);
                                    setWorkTicketReturnDialogOpen(true);
                                  }}
                                >
                                  Return
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Open work ticket detail/view dialog
                                  toast.info("Work ticket detail view coming soon");
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Driver Permits</CardTitle>
                    <CardDescription>Manage Military Driving Permits</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setSelectedPermit(null);
                    setDriverPermitDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Issue New Permit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {driverPermits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No driver permits found. Issue one to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permit #</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle Classes</TableHead>
                        <TableHead>Issued Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverPermits.map((permit: any) => (
                        <TableRow key={permit.id}>
                          <TableCell className="font-medium">{permit.permit_number}</TableCell>
                          <TableCell>
                            {permit.driver?.rank || ''} {permit.driver?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {permit.vehicle_classes?.map((vc: string) => (
                                <Badge key={vc} variant="outline" className="text-xs">
                                  {vc}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {permit.issued_date ? format(new Date(permit.issued_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {permit.expiry_date ? format(new Date(permit.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                permit.status === 'active' ? 'default' : 
                                permit.status === 'expired' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {permit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPermit(permit);
                                setDriverPermitDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pol" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>POL (Petrol, Oil, Lubricants) Management</CardTitle>
                <CardDescription>Fuel consumption tracking and accounting (TTR Form 14)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : stats.totalPOLConsumption}</div>
                        <p className="text-xs text-muted-foreground mt-1">Litres this month</p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    POL accounts are automatically created when fuel is issued via work tickets. 
                    View detailed POL management in the dedicated POL Management page.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/pol-management'}
                  >
                    <Fuel className="mr-2 h-4 w-4" />
                    Open POL Management Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inspections">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Inspection scheduling and tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Work Ticket Dialog */}
        <MTWorkTicketDialog
          open={workTicketDialogOpen}
          onOpenChange={setWorkTicketDialogOpen}
          onSuccess={() => {
            fetchMTStats();
            refetchTickets();
            setWorkTicketDialogOpen(false);
          }}
        />

        {/* Work Ticket Return Dialog */}
        <WorkTicketReturnDialog
          open={workTicketReturnDialogOpen}
          onOpenChange={(open) => {
            setWorkTicketReturnDialogOpen(open);
            if (!open) setSelectedTicketForReturn(null);
          }}
          ticket={selectedTicketForReturn}
          onSuccess={() => {
            fetchMTStats();
            refetchTickets();
            setWorkTicketReturnDialogOpen(false);
            setSelectedTicketForReturn(null);
          }}
        />

        {/* Driver Permit Dialog */}
        <MTDriverPermitDialog
          open={driverPermitDialogOpen}
          onOpenChange={(open) => {
            setDriverPermitDialogOpen(open);
            if (!open) setSelectedPermit(null);
          }}
          permit={selectedPermit}
          onSuccess={() => {
            fetchMTStats();
            refetchPermits();
            setDriverPermitDialogOpen(false);
            setSelectedPermit(null);
          }}
        />
      </main>
    </div>
  );
}

