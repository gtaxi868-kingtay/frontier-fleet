import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ClipboardList, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsData {
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisMonth: number;
    lastMonth: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byType: { issue: number; return: number; transfer: number };
  };
  inventory: {
    totalItems: number;
    lowStock: number;
    serviceableRate: number;
    unserviceableCount: number;
  };
  alerts: {
    total: number;
    unacknowledged: number;
    byPriority: { high: number; medium: number; low: number };
  };
}

export default function Analytics() {
  const { role } = useAuth();
  const { canViewAnalytics } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    requests: { total: 0, pending: 0, approved: 0, rejected: 0, thisMonth: 0, lastMonth: 0 },
    transactions: { total: 0, thisMonth: 0, lastMonth: 0, byType: { issue: 0, return: 0, transfer: 0 } },
    inventory: { totalItems: 0, lowStock: 0, serviceableRate: 0, unserviceableCount: 0 },
    alerts: { total: 0, unacknowledged: 0, byPriority: { high: 0, medium: 0, low: 0 } },
  });

  useEffect(() => {
    if (canViewAnalytics) {
      fetchAnalyticsData();
    }
  }, [canViewAnalytics]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch requests data
      const { data: requests } = await supabase
        .from('inventory_requests')
        .select('*');

      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const requestsThisMonth = requests?.filter(r => 
        new Date(r.created_at!) >= firstDayThisMonth
      ).length || 0;

      const requestsLastMonth = requests?.filter(r => {
        const created = new Date(r.created_at!);
        return created >= firstDayLastMonth && created <= lastDayLastMonth;
      }).length || 0;

      // Fetch transactions data
      const { data: transactions } = await supabase
        .from('transactions_detailed')
        .select('*');

      const transactionsThisMonth = transactions?.filter(t => 
        new Date(t.created_at!) >= firstDayThisMonth
      ).length || 0;

      const transactionsLastMonth = transactions?.filter(t => {
        const created = new Date(t.created_at!);
        return created >= firstDayLastMonth && created <= lastDayLastMonth;
      }).length || 0;

      const transactionsByType = {
        issue: transactions?.filter(t => t.transaction_type === 'issue').length || 0,
        return: transactions?.filter(t => t.transaction_type === 'return').length || 0,
        transfer: transactions?.filter(t => t.transaction_type === 'transfer').length || 0,
      };

      // Fetch inventory data
      const [
        { data: weapons },
        { data: tools },
        { data: engineerEquipment },
        { data: ppe },
        { data: generalInventory }
      ] = await Promise.all([
        supabase.from('weapons').select('*'),
        supabase.from('tools').select('*'),
        supabase.from('engineer_equipment').select('*'),
        supabase.from('ppe').select('*'),
        supabase.from('general_inventory').select('*')
      ]);

      const totalItems = (weapons?.length || 0) + 
                         (tools?.length || 0) + 
                         (engineerEquipment?.length || 0) + 
                         (ppe?.length || 0) + 
                         (generalInventory?.length || 0);

      const serviceableWeapons = weapons?.filter(w => w.serviceable).length || 0;
      const serviceableTools = tools?.filter(t => t.serviceable).length || 0;
      const serviceableEquipment = engineerEquipment?.filter(e => e.serviceable).length || 0;
      const serviceablePPE = ppe?.filter(p => p.serviceable).length || 0;

      const serviceableCount = serviceableWeapons + serviceableTools + serviceableEquipment + serviceablePPE;
      const serviceableTotal = (weapons?.length || 0) + (tools?.length || 0) + 
                               (engineerEquipment?.length || 0) + (ppe?.length || 0);
      const serviceableRate = serviceableTotal > 0 ? (serviceableCount / serviceableTotal) * 100 : 0;
      
      const unserviceableCount = serviceableTotal - serviceableCount;

      const lowStock = generalInventory?.filter(item =>
        (item.reorder_level || 0) > 0 && (item.qty_on_hand || 0) <= (item.reorder_level || 0)
      ).length || 0;

      // Fetch alerts data
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('recipient_role', role);

      const alertsByPriority = {
        high: alerts?.filter(a => a.priority?.toLowerCase() === 'high').length || 0,
        medium: alerts?.filter(a => a.priority?.toLowerCase() === 'medium').length || 0,
        low: alerts?.filter(a => a.priority?.toLowerCase() === 'low').length || 0,
      };

      setData({
        requests: {
          total: requests?.length || 0,
          pending: requests?.filter(r => r.status === 'pending').length || 0,
          approved: requests?.filter(r => r.status === 'approved').length || 0,
          rejected: requests?.filter(r => r.status === 'rejected').length || 0,
          thisMonth: requestsThisMonth,
          lastMonth: requestsLastMonth,
        },
        transactions: {
          total: transactions?.length || 0,
          thisMonth: transactionsThisMonth,
          lastMonth: transactionsLastMonth,
          byType: transactionsByType,
        },
        inventory: {
          totalItems,
          lowStock,
          serviceableRate: Math.round(serviceableRate),
          unserviceableCount,
        },
        alerts: {
          total: alerts?.length || 0,
          unacknowledged: alerts?.filter(a => !a.acknowledged).length || 0,
          byPriority: alertsByPriority,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, isUp: false };
    const percent = Math.round(((current - previous) / previous) * 100);
    return { percent: Math.abs(percent), isUp: percent >= 0 };
  };

  const requestTrend = calculateTrend(data.requests.thisMonth, data.requests.lastMonth);
  const transactionTrend = calculateTrend(data.transactions.thisMonth, data.transactions.lastMonth);

  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto p-6">
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to view analytics.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive battalion readiness and operational metrics
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>Total Requests</span>
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.requests.total}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {requestTrend.isUp ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={requestTrend.isUp ? "text-green-500" : "text-red-500"}>
                        {requestTrend.percent}% from last month
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-medium">{data.requests.pending}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Approved</span>
                        <span className="font-medium text-green-600">{data.requests.approved}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>Transactions</span>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.transactions.total}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {transactionTrend.isUp ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={transactionTrend.isUp ? "text-green-500" : "text-red-500"}>
                        {transactionTrend.percent}% from last month
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Issues</span>
                        <span className="font-medium">{data.transactions.byType.issue}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Returns</span>
                        <span className="font-medium">{data.transactions.byType.return}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>Serviceability</span>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.inventory.serviceableRate}%</div>
                    <Progress value={data.inventory.serviceableRate} className="mt-3 h-2" />
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Items</span>
                        <span className="font-medium">{data.inventory.totalItems}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Unserviceable</span>
                        <span className="font-medium text-red-600">{data.inventory.unserviceableCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>Active Alerts</span>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.alerts.unacknowledged}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {data.alerts.total} total alerts
                    </p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">High Priority</span>
                        <Badge variant="destructive" className="h-5">
                          {data.alerts.byPriority.high}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Medium Priority</span>
                        <Badge variant="secondary" className="h-5">
                          {data.alerts.byPriority.medium}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Request Status Distribution
                    </CardTitle>
                    <CardDescription>
                      Current month request breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Pending</span>
                          <span className="text-sm text-muted-foreground">
                            {data.requests.pending} requests
                          </span>
                        </div>
                        <Progress 
                          value={(data.requests.pending / data.requests.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Approved</span>
                          <span className="text-sm text-muted-foreground">
                            {data.requests.approved} requests
                          </span>
                        </div>
                        <Progress 
                          value={(data.requests.approved / data.requests.total) * 100} 
                          className="h-2 [&>div]:bg-green-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Rejected</span>
                          <span className="text-sm text-muted-foreground">
                            {data.requests.rejected} requests
                          </span>
                        </div>
                        <Progress 
                          value={(data.requests.rejected / data.requests.total) * 100} 
                          className="h-2 [&>div]:bg-red-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Inventory Health
                    </CardTitle>
                    <CardDescription>
                      Stock levels and serviceability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Serviceability Rate</span>
                          <span className="text-sm font-bold text-green-600">
                            {data.inventory.serviceableRate}%
                          </span>
                        </div>
                        <Progress 
                          value={data.inventory.serviceableRate} 
                          className="h-2 [&>div]:bg-green-500"
                        />
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Low Stock Items</p>
                            <p className="text-xs text-muted-foreground">
                              Items at or below reorder level
                            </p>
                          </div>
                          <Badge variant={data.inventory.lowStock > 0 ? "destructive" : "secondary"}>
                            {data.inventory.lowStock}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.requests.thisMonth}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requests submitted</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.requests.lastMonth}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requests submitted</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Approval Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {data.requests.total > 0 
                        ? Math.round((data.requests.approved / data.requests.total) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Overall approval rate</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Inventory Summary</CardTitle>
                  <CardDescription>
                    Overview of current inventory status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Total Inventory Items</p>
                      <p className="text-2xl font-bold">{data.inventory.totalItems}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Low Stock Alerts</p>
                      <p className="text-2xl font-bold text-destructive">{data.inventory.lowStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-500">High Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.alerts.byPriority.high}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                  </CardContent>
                </Card>
                <Card className="border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Medium Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.alerts.byPriority.medium}</div>
                    <p className="text-xs text-muted-foreground mt-1">Action needed soon</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-blue-500">Low Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.alerts.byPriority.low}</div>
                    <p className="text-xs text-muted-foreground mt-1">Informational alerts</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
