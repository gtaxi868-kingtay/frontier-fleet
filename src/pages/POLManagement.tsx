import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Fuel, TrendingUp, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function POLManagement() {
  const { role } = useAuth();
  const [stats, setStats] = useState({
    totalConsumption: 0,
    monthlyConsumption: 0,
    averageMPG: 0,
    jerricansTotal: 0,
    jerricansAssigned: 0,
    jerricansReserve: 0,
  });

  const isMTO = role === 'MTO' || role === 'S4' || role === 'CO' || role === 'S4_ADMIN';

  // Fetch POL accounts
  const { data: polAccounts = [], refetch: refetchAccounts } = useQuery({
    queryKey: ['pol_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pol_accounts')
        .select(`
          *,
          vehicle:vehicles(vehicle_id, vehicle_type),
          work_ticket:mt_work_tickets(ticket_number)
        `)
        .order('issued_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: isMTO,
  });

  // Fetch jerrican inventory
  const { data: jerricans = [] } = useQuery({
    queryKey: ['jerrican_inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jerrican_inventory')
        .select('*')
        .order('jerrican_number');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isMTO,
  });

  useEffect(() => {
    if (isMTO) {
      calculatePOLStats();
    }
  }, [polAccounts, jerricans, isMTO]);

  const calculatePOLStats = () => {
    // Calculate monthly consumption (current month)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyAccounts = polAccounts.filter((acc: any) => 
      acc.account_period_month && acc.account_period_month.startsWith(currentMonth)
    );
    const monthlyConsumption = monthlyAccounts.reduce((sum: number, acc: any) => 
      sum + (parseFloat(acc.petrol_issued) || 0), 0
    );

    // Calculate total consumption
    const totalConsumption = polAccounts.reduce((sum: number, acc: any) => 
      sum + (parseFloat(acc.petrol_issued) || 0), 0
    );

    // Calculate average MPG
    const accountsWithMPG = polAccounts.filter((acc: any) => acc.mpg_calculated);
    const avgMPG = accountsWithMPG.length > 0
      ? accountsWithMPG.reduce((sum: number, acc: any) => sum + (parseFloat(acc.mpg_calculated) || 0), 0) / accountsWithMPG.length
      : 0;

    // Calculate jerrican stats
    const jerricansAssigned = jerricans.filter((j: any) => j.vehicle_assigned && !j.battalion_reserve).length;
    const jerricansReserve = jerricans.filter((j: any) => j.battalion_reserve).length;

    setStats({
      totalConsumption: Math.round(totalConsumption),
      monthlyConsumption: Math.round(monthlyConsumption),
      averageMPG: Math.round(avgMPG * 100) / 100,
      jerricansTotal: jerricans.length,
      jerricansAssigned,
      jerricansReserve,
    });
  };

  if (!isMTO) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need MTO role to access POL management</CardDescription>
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
          <h1 className="text-3xl font-bold tracking-tight">POL Management</h1>
          <p className="text-muted-foreground">
            Petrol, Oil, and Lubricants tracking and accounting (TTR Form 14)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyConsumption}</div>
              <p className="text-xs text-muted-foreground mt-1">Litres this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsumption}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average MPG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageMPG}</div>
              <p className="text-xs text-muted-foreground mt-1">Miles per gallon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jerricans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jerricansTotal}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.jerricansAssigned} assigned, {stats.jerricansReserve} reserve
              </p>
            </CardContent>
          </Card>
        </div>

        {/* POL Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>POL Accounts (TTR Form 14)</CardTitle>
            <CardDescription>Fuel consumption tracking and accounting</CardDescription>
          </CardHeader>
          <CardContent>
            {polAccounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No POL accounts found. Accounts are created automatically when fuel is issued via work tickets.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Work Ticket</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Petrol (L)</TableHead>
                    <TableHead>Oil (L)</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>MPG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polAccounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        {account.vehicle?.vehicle_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {account.work_ticket?.ticket_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {account.issued_date ? format(new Date(account.issued_date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{account.petrol_issued || 0}</TableCell>
                      <TableCell>{account.oil_issued || 0}</TableCell>
                      <TableCell>
                        {account.mileage_total ? `${account.mileage_total} km` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {account.mpg_calculated ? account.mpg_calculated.toFixed(2) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Jerrican Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Jerrican Inventory</CardTitle>
            <CardDescription>Reserve petrol jerricans (2 per 4-wheeled vehicle + 100 Bn reserve)</CardDescription>
          </CardHeader>
          <CardContent>
            {jerricans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No jerricans in inventory. Add jerricans to track reserve fuel.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jerrican #</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level (L)</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jerricans.map((jerrican: any) => (
                    <TableRow key={jerrican.id}>
                      <TableCell className="font-medium">{jerrican.jerrican_number}</TableCell>
                      <TableCell>
                        {jerrican.battalion_reserve ? (
                          <Badge variant="default">Bn Reserve</Badge>
                        ) : jerrican.vehicle_assigned ? (
                          `Vehicle ${jerrican.vehicle_assigned}`
                        ) : (
                          'Unassigned'
                        )}
                      </TableCell>
                      <TableCell>{jerrican.fuel_type || 'Petrol'}</TableCell>
                      <TableCell>{jerrican.current_level || 0} / {jerrican.capacity || 20}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            jerrican.condition === 'good' ? 'default' : 
                            jerrican.condition === 'needs_repair' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {jerrican.condition || 'Good'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {jerrican.last_checked_date ? format(new Date(jerrican.last_checked_date), 'MMM dd, yyyy') : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

