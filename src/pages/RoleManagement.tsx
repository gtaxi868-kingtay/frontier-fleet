import { useEffect, useState } from 'react';
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RoleRequest {
  id: string;
  user_id: string;
  role: 'CO' | 'S4' | 'OC' | 'SQMS' | 'Soldier';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    name: string;
    rank: string;
    unit_id: string | null;
  };
}

export default function RoleManagement() {
  const { role } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // Fetch role requests
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleError) throw roleError;

      // Fetch profiles for all users
      const userIds = roleData.map(r => r.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, rank, unit_id')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine data
      const combined = roleData.map(role => ({
        ...role,
        profiles: profileData.find(p => p.id === role.user_id) || { name: 'Unknown', rank: '', unit_id: null }
      }));

      setRequests(combined as RoleRequest[]);
    } catch (error) {
      console.error('Error fetching role requests:', error);
      toast.error('Failed to load role requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Set up realtime subscription
    const channel = supabase
      .channel('role_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (requestId: string, userRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;
      toast.success(`${userRole} role approved successfully`);
    } catch (error: any) {
      console.error('Error approving role:', error);
      toast.error(error.message || 'Failed to approve role');
    }
  };

  const handleReject = async (requestId: string, userRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      toast.success(`${userRole} role rejected`);
    } catch (error: any) {
      console.error('Error rejecting role:', error);
      toast.error(error.message || 'Failed to reject role');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      CO: 'bg-red-500/10 text-red-600 border-red-500/20',
      S4: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      OC: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      SQMS: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      Soldier: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };
    return <Badge variant="outline" className={colors[role] || ''}>{role}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading role requests...</div>
          </div>
        </main>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Role Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Approve or reject user role requests
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-card">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-medium">Your Role: {role}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedRequests.length}</div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Pending Role Requests</CardTitle>
            <CardDescription>Review and approve or reject user role requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending role requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Requested Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.profiles.name}</TableCell>
                      <TableCell>{request.profiles.rank}</TableCell>
                      <TableCell>{getRoleBadge(request.role)}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={() => handleApprove(request.id, request.role)}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReject(request.id, request.role)}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* All Requests History */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Role Requests</CardTitle>
            <CardDescription>Complete history of role assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.profiles.name}</TableCell>
                    <TableCell>{request.profiles.rank}</TableCell>
                    <TableCell>{getRoleBadge(request.role)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
