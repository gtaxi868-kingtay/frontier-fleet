import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApproveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export function ApproveRequestDialog({ open, onOpenChange, request }: ApproveRequestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const approveMutation = useMutation({
    mutationFn: async ({ approve, reason }: { approve: boolean; reason?: string }) => {
      const updateData: any = {
        status: approve ? 'approved' : 'rejected',
      };

      if (approve) {
        updateData.approved_by = user!.id;
        updateData.approved_at = new Date().toISOString();
      } else {
        updateData.rejected_by = user!.id;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('inventory_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      // Create alert for requester
      await supabase.from('alerts').insert({
        recipient_role: request.requester_role,
        unit_id: request.unit_id,
        message: approve 
          ? `Your inventory request for ${request.item_name || request.item_type} has been approved.`
          : `Your inventory request for ${request.item_name || request.item_type} has been rejected. Reason: ${reason}`,
        priority: approve ? 'Medium' : 'High',
        alert_type: 'request_update',
        related_item_id: request.id,
        action_required: !approve,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approve ? 'Request Approved' : 'Request Rejected',
        description: variables.approve 
          ? 'The inventory request has been approved.'
          : 'The inventory request has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-requests'] });
      onOpenChange(false);
      setAction(null);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApprove = () => {
    approveMutation.mutate({ approve: true });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }
    approveMutation.mutate({ approve: false, reason: rejectionReason });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Inventory Request</DialogTitle>
          <DialogDescription>
            Review and approve or reject this inventory request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <span className="text-sm text-muted-foreground">Request Type:</span>
              <p className="font-medium">{request.request_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Item Type:</span>
              <p className="font-medium">{request.item_type}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Item Name:</span>
              <p className="font-medium">{request.item_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <p className="font-medium">{request.quantity}</p>
            </div>
          </div>

          {request.specifications && (
            <div>
              <Label>Specifications</Label>
              <p className="text-sm text-muted-foreground mt-1">{request.specifications}</p>
            </div>
          )}

          <div>
            <Label>Justification</Label>
            <p className="text-sm text-muted-foreground mt-1">{request.justification}</p>
          </div>

          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a detailed reason for rejection..."
                rows={4}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            {action === null ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setAction('reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            ) : action === 'reject' ? (
              <>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Back
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
