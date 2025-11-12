import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { CreateRequestDialog } from '@/components/CreateRequestDialog';
import { ApproveRequestDialog } from '@/components/ApproveRequestDialog';
import { format } from 'date-fns';

export default function InventoryRequests() {
  const { canCreateRequests, canApproveRequests, role } = usePermissions();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['inventory-requests', role],
    queryFn: async () => {
      let query = supabase
        .from('inventory_requests')
        .select(`
          *,
          requester:profiles!inventory_requests_requester_id_fkey(name, rank),
          unit:units(name),
          approver:profiles!inventory_requests_approved_by_fkey(name, rank),
          rejecter:profiles!inventory_requests_rejected_by_fkey(name, rank)
        `)
        .order('created_at', { ascending: false });

      if (role === 'OC' || role === 'SQMS') {
        query = query.eq('requester_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      new_item: 'bg-blue-500/10 text-blue-600',
      replacement: 'bg-purple-500/10 text-purple-600',
      additional: 'bg-indigo-500/10 text-indigo-600',
    };
    return <Badge variant="outline" className={colors[type] || ''}>{type.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading requests...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Requests</h1>
          <p className="text-muted-foreground mt-1">
            {canCreateRequests ? 'Submit and track your inventory requests' : 'Review and approve inventory requests'}
          </p>
        </div>
        {canCreateRequests && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {requests?.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {request.item_name || request.item_type}
                    {getRequestTypeBadge(request.request_type)}
                  </CardTitle>
                  <CardDescription>
                    Requested by {request.requester?.rank} {request.requester?.name} • {format(new Date(request.created_at), 'PPp')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  {canApproveRequests && request.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedRequest(request);
                        setApproveDialogOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Item Type:</span>
                  <p className="font-medium">{request.item_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">{request.quantity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Unit:</span>
                  <p className="font-medium">{request.unit?.name || 'N/A'}</p>
                </div>
                {request.specifications && (
                  <div>
                    <span className="text-muted-foreground">Specifications:</span>
                    <p className="font-medium text-xs">{request.specifications}</p>
                  </div>
                )}
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Justification:</span>
                <p className="text-sm mt-1">{request.justification}</p>
              </div>

              {request.status === 'approved' && request.approver && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/5 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  Approved by {request.approver.rank} {request.approver.name} on {format(new Date(request.approved_at), 'PPp')}
                </div>
              )}

              {request.status === 'rejected' && request.rejecter && (
                <div className="flex flex-col gap-1 text-sm text-red-600 bg-red-500/5 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Rejected by {request.rejecter.rank} {request.rejecter.name} on {format(new Date(request.rejected_at), 'PPp')}
                  </div>
                  {request.rejection_reason && (
                    <p className="text-xs ml-6">Reason: {request.rejection_reason}</p>
                  )}
                </div>
              )}

              {request.report_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={request.report_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {requests?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No inventory requests found</p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRequestDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedRequest && (
        <ApproveRequestDialog 
          open={approveDialogOpen} 
          onOpenChange={setApproveDialogOpen}
          request={selectedRequest}
        />
      )}
    </div>
  );
}
