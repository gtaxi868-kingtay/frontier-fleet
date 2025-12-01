import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, AlertTriangle, CheckCircle2, Calendar, FileText, Package, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkshopInspectionDialog } from "@/components/WorkshopInspectionDialog";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function WorkshopDashboard() {
  const { role, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    serviceableEquipment: 0,
    needsRepair: 0,
    beyondCapacity: 0,
    pendingInspections: 0,
    activeRepairs: 0,
    completedRepairs: 0,
    efficiencyRating: 'Good',
  });

  // Check if user has access
  const hasAccess = role === 'WKSP_WO' || role === 'S4' || role === 'CO' || role === 'S4_ADMIN' || role === 'OC';
  
  // Fetch workshop inspections
  const { data: inspections = [], refetch: refetchInspections } = useQuery({
    queryKey: ['workshop_inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop_inspections')
        .select(`
          *,
          unit:units(name),
          inspected_by:profiles!workshop_inspections_inspected_by_id_fkey(name, rank)
        `)
        .order('inspection_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: hasAccess,
  });

  useEffect(() => {
    if (!hasAccess) return;
    fetchWorkshopStats();
  }, [hasAccess, inspections]);

  const fetchWorkshopStats = async () => {
    setLoading(true);
    try {
      // Fetch workshop inspections (bimonthly)
      const { data: inspections } = await supabase
        .from('workshop_inspections')
        .select('*');
      
      const totalInspections = inspections?.length || 0;
      const serviceableCount = inspections?.filter(i => i.inspection_status === 'serviceable').length || 0;
      const needsRepairCount = inspections?.filter(i => i.inspection_status === 'needs_repair').length || 0;
      const beyondCapacityCount = inspections?.filter(i => i.inspection_status === 'beyond_capacity').length || 0;

      // Fetch workshop repairs
      const { data: repairs } = await supabase.from('workshop_repairs').select('*');
      const activeRepairs = repairs?.filter(r => r.repair_status === 'in_progress' || r.repair_status === 'pending').length || 0;
      const completedRepairs = repairs?.filter(r => r.repair_status === 'completed').length || 0;

      // Calculate pending inspections (next inspection due <= today or in next week)
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      const pendingInspections = inspections?.filter(i => {
        if (!i.next_inspection_due) return false;
        return i.next_inspection_due <= nextWeekStr;
      }).length || 0;

      // Calculate efficiency rating (simplified)
      const totalRepairs = repairs?.length || 0;
      const completionRate = totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 100;
      let efficiencyRating = 'Excellent';
      if (completionRate < 70) efficiencyRating = 'Needs Improvement';
      else if (completionRate < 85) efficiencyRating = 'Good';
      else if (completionRate < 95) efficiencyRating = 'Very Good';

      setStats({
        totalEquipment: totalInspections,
        serviceableEquipment: serviceableCount,
        needsRepair: needsRepairCount,
        beyondCapacity: beyondCapacityCount,
        pendingInspections,
        activeRepairs,
        completedRepairs,
        efficiencyRating,
      });
    } catch (error) {
      console.error('Error fetching workshop stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need Workshop WO, EME OC, S4, or CO role to access this dashboard</CardDescription>
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
          <h1 className="text-3xl font-bold tracking-tight">Workshop Dashboard</h1>
          <p className="text-muted-foreground">
            Equipment inspection, repair tracking, and workshop efficiency monitoring
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalEquipment}</div>
              <p className="text-xs text-muted-foreground mt-1">On charge</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Serviceable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : stats.serviceableEquipment}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Needs Repair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{loading ? "..." : stats.needsRepair}</div>
              <p className="text-xs text-muted-foreground mt-1">Within capacity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Beyond Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{loading ? "..." : stats.beyondCapacity}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires referral</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Repairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <Badge variant="outline">{loading ? "..." : stats.activeRepairs}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <Badge variant="default">{loading ? "..." : stats.completedRepairs}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.pendingInspections}</div>
              <p className="text-xs text-muted-foreground mt-1">Due in next 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.efficiencyRating}</div>
              <p className="text-xs text-muted-foreground mt-1">Workshop rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common workshop management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => {
                  setSelectedInspection(null);
                  setInspectionDialogOpen(true);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Schedule Inspection
              </Button>
              <Button variant="outline" className="justify-start">
                <Wrench className="mr-2 h-4 w-4" />
                Create Repair
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Package className="mr-2 h-4 w-4" />
                View Equipment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
            <TabsTrigger value="reports">Reports to MTO</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workshop Operations Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed overview coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inspections" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bimonthly Inspections</CardTitle>
                    <CardDescription>Equipment inspection tracking and reports to MTO</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setSelectedInspection(null);
                    setInspectionDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Inspection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inspections.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No inspections recorded. Create one to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Inspection #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((inspection: any) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.inspection_number}</TableCell>
                          <TableCell>
                            {inspection.inspection_date ? format(new Date(inspection.inspection_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {inspection.equipment_name || inspection.equipment_reference || 'N/A'}
                          </TableCell>
                          <TableCell>{inspection.unit?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                inspection.inspection_status === 'serviceable' ? 'default' : 
                                inspection.inspection_status === 'needs_repair' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {inspection.inspection_status?.replace('_', ' ') || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {inspection.next_inspection_due ? format(new Date(inspection.next_inspection_due), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInspection(inspection);
                                setInspectionDialogOpen(true);
                              }}
                            >
                              View
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
          
          <TabsContent value="repairs">
            <Card>
              <CardHeader>
                <CardTitle>Repair Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Repair queue and tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports to MTO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Report generation and submission coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Equipment status tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Workshop Inspection Dialog */}
        <WorkshopInspectionDialog
          open={inspectionDialogOpen}
          onOpenChange={(open) => {
            setInspectionDialogOpen(open);
            if (!open) setSelectedInspection(null);
          }}
          inspection={selectedInspection}
          onSuccess={() => {
            fetchWorkshopStats();
            refetchInspections();
            setInspectionDialogOpen(false);
            setSelectedInspection(null);
          }}
        />
      </main>
    </div>
  );
}

