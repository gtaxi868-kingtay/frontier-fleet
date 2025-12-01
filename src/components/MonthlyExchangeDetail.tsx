import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExchangeItemIssueDialog } from "./ExchangeItemIssueDialog";
import { executeExchange, validateExchangeItems } from "@/lib/exchangeWorkflow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MonthlyExchangeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchange: any;
  onUpdate: () => void;
}

export function MonthlyExchangeDetail({ open, onOpenChange, exchange, onUpdate }: MonthlyExchangeDetailProps) {
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();
  const [qmDecision, setQmDecision] = useState<string>(exchange?.qm_decision || "");
  const [qmNotes, setQmNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const isQM = role === 'S4' || role === 'CO' || role === 'S4_ADMIN';

  // Fetch items handed in
  const { data: itemsHandedIn = [] } = useQuery({
    queryKey: ['exchange-items-handed-in', exchange?.items_handed_in],
    queryFn: async () => {
      if (!exchange?.items_handed_in || exchange.items_handed_in.length === 0) return [];

      const { data, error } = await supabase
        .from('clothing_equipment_issues')
        .select(`
          id,
          issue_number,
          item_name,
          quantity_issued,
          issue_date,
          return_date,
          soldier_id,
          soldier:profiles!clothing_equipment_issues_soldier_id_fkey(id, name, rank, service_number)
        `)
        .in('id', exchange.items_handed_in);

      if (error) throw error;
      return data || [];
    },
    enabled: !!exchange?.items_handed_in && exchange.items_handed_in.length > 0,
  });

  // Fetch items issued (if any)
  const { data: itemsIssued = [] } = useQuery({
    queryKey: ['exchange-items-issued', exchange?.items_issued],
    queryFn: async () => {
      if (!exchange?.items_issued || exchange.items_issued.length === 0) return [];

      const { data, error } = await supabase
        .from('clothing_equipment_issues')
        .select(`
          id,
          issue_number,
          item_name,
          quantity_issued,
          issue_date,
          soldier:profiles!clothing_equipment_issues_soldier_id_fkey(name, rank)
        `)
        .in('id', exchange.items_issued);

      if (error) throw error;
      return data || [];
    },
    enabled: !!exchange?.items_issued && exchange.items_issued.length > 0,
  });

  // Check if exchange execution is needed
  const needsExecution = exchange?.qm_approved && 
    exchange?.items_handed_in && 
    exchange.items_handed_in.length > 0 &&
    itemsHandedIn.some((item: any) => !item.return_date); // Some items not yet returned

  const canExecute = (isQM || role === 'SQMS') && needsExecution;

  const handleApprove = async (approved: boolean) => {
    if (!exchange) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clothing_exchanges')
        .update({
          qm_reviewed: true,
          qm_approved: approved,
          qm_decision: qmDecision || (approved ? 'approved' : 'rejected'),
          qm_reviewed_by_id: profile?.id,
          notes: qmNotes ? ((exchange.notes || '') + '\nQM Notes: ' + qmNotes) : exchange.notes,
        })
        .eq('id', exchange.id);

      if (error) {
        console.error('Error updating exchange:', error);
        throw new Error(error.message || "Failed to update exchange");
      }
      
      toast.success(`Exchange ${approved ? 'approved' : 'rejected'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['clothing_exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-items-handed-in'] });
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update exchange";
      console.error('Error in handleApprove:', error);
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('You do not have permission to approve/reject exchanges.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteExchange = async (newIssueIds: string[]) => {
    if (!exchange) return;
    
    setExecuting(true);
    try {
      // Validate items first
      const validation = await validateExchangeItems(exchange.items_handed_in);
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Validate exchange is approved
      if (!exchange.qm_approved) {
        toast.error('Exchange must be approved by QM before execution.');
        return;
      }

      // Execute exchange using RPC function for atomicity
      const { data: result, error } = await supabase.rpc('execute_clothing_exchange', {
        p_exchange_id: exchange.id,
        p_items_to_return: exchange.items_handed_in,
        p_new_issue_ids: newIssueIds.length > 0 ? newIssueIds : null,
      });

      if (error) {
        console.error('RPC error:', error);
        throw new Error(`Database error: ${error.message || 'Failed to execute exchange'}`);
      }

      if (result && !result.success) {
        throw new Error(result.error || 'Exchange execution failed');
      }

      const itemsReturned = result?.items_returned || exchange.items_handed_in?.length || 0;
      const itemsIssued = newIssueIds.length;
      
      toast.success(
        `Exchange executed successfully. ${itemsReturned} item(s) marked as returned.` +
        (itemsIssued > 0 ? ` ${itemsIssued} replacement item(s) issued.` : '')
      );
      
      queryClient.invalidateQueries({ queryKey: ['clothing_exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-items-handed-in'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-items-issued'] });
      queryClient.invalidateQueries({ queryKey: ['clothing_equipment_issues'] });
      onUpdate();
    } catch (error: any) {
      console.error('Error executing exchange:', error);
      const errorMessage = error.message || 'Failed to execute exchange';
      
      // Provide specific error messages
      if (errorMessage.includes('already been returned')) {
        toast.error('Some items have already been returned. Please refresh and try again.');
      } else if (errorMessage.includes('must be approved')) {
        toast.error('Exchange must be approved by QM before execution.');
      } else if (errorMessage.includes('not found')) {
        toast.error('Exchange record not found. Please refresh and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setExecuting(false);
      setIssueDialogOpen(false);
    }
  };

  const handleExecuteWithoutNewItems = async () => {
    // Just mark items as returned without issuing new ones
    await handleExecuteExchange([]);
  };

  if (!exchange) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly Exchange Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Exchange Month:</Label>
              <div className="font-medium">{format(new Date(exchange.exchange_month), 'MMMM yyyy')}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Exchange Date:</Label>
              <div className="font-medium">{format(new Date(exchange.exchange_date), 'dd MMM yyyy')}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Item:</Label>
              <div className="font-medium">{exchange.item_name}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Quantity:</Label>
              <div className="font-medium">{exchange.quantity_exchanged}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Reason:</Label>
              <Badge variant="outline" className="capitalize">{exchange.exchange_reason}</Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Unit:</Label>
              <div className="font-medium">{exchange.unit?.name || 'N/A'}</div>
            </div>
          </div>

          {itemsHandedIn.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Items Handed In:</Label>
              <div className="mt-2 space-y-2">
                {itemsHandedIn.map((issue: any) => (
                  <div key={issue.id} className={`p-3 border rounded-lg ${
                    issue.return_date ? 'bg-green-50 dark:bg-green-950/20' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Issue #{issue.issue_number}</div>
                      {issue.return_date && (
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Returned
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {issue.soldier?.rank} {issue.soldier?.name} - Qty: {issue.quantity_issued}
                    </div>
                    {issue.return_date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Returned: {format(new Date(issue.return_date), 'dd MMM yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {itemsIssued.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Items Issued (Replacements):</Label>
              <div className="mt-2 space-y-2">
                {itemsIssued.map((issue: any) => (
                  <div key={issue.id} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="font-medium">Issue #{issue.issue_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.soldier?.rank} {issue.soldier?.name} - Qty: {issue.quantity_issued}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {exchange.notes && (
            <div>
              <Label className="text-sm font-medium">Notes:</Label>
              <p className="text-sm mt-2 p-3 bg-muted rounded-lg">{exchange.notes}</p>
            </div>
          )}

          {isQM && !exchange.qm_reviewed && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label htmlFor="qm-decision">QM Decision *</Label>
                <Select value={qmDecision} onValueChange={setQmDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qm-notes">QM Notes</Label>
                <Textarea
                  id="qm-notes"
                  placeholder="Additional notes or instructions..."
                  value={qmNotes}
                  onChange={(e) => setQmNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleApprove(false)}
                  disabled={loading || !qmDecision}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(true)}
                  disabled={loading || !qmDecision}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Exchange
                </Button>
              </div>
            </div>
          )}

          {exchange.qm_reviewed && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">QM Review:</Label>
              <div className="mt-2 flex items-center gap-2">
                {exchange.qm_approved ? (
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                )}
                {exchange.qm_reviewer && (
                  <span className="text-sm text-muted-foreground">
                    by {exchange.qm_reviewer.rank} {exchange.qm_reviewer.name}
                  </span>
                )}
              </div>
              {exchange.qm_decision && (
                <p className="text-sm text-muted-foreground mt-2">{exchange.qm_decision}</p>
              )}
            </div>
          )}

          {/* Execute Exchange Section */}
          {canExecute && (
            <div className="border-t pt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Execute Exchange</AlertTitle>
                <AlertDescription>
                  This exchange has been approved. Mark old items as returned and issue replacement items.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExecuteWithoutNewItems}
                  disabled={executing}
                >
                  {executing ? "Processing..." : "Mark Items Returned (No Replacements)"}
                </Button>
                <Button
                  onClick={() => setIssueDialogOpen(true)}
                  disabled={executing}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Issue Replacement Items
                </Button>
              </div>
            </div>
          )}

          {/* Show execution status if items already returned */}
          {exchange?.qm_approved && itemsHandedIn.length > 0 && 
           itemsHandedIn.every((item: any) => item.return_date) && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Exchange Completed</AlertTitle>
              <AlertDescription>
                All items have been marked as returned. 
                {itemsIssued.length > 0 && ` ${itemsIssued.length} replacement item(s) issued.`}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>

      {/* Exchange Item Issue Dialog */}
      {exchange && (
        <ExchangeItemIssueDialog
          open={issueDialogOpen}
          onOpenChange={setIssueDialogOpen}
          onSuccess={handleExecuteExchange}
          exchange={{
            id: exchange.id,
            item_name: exchange.item_name,
            items_handed_in: exchange.items_handed_in || [],
            unit_id: exchange.unit_id,
          }}
          itemsHandedIn={itemsHandedIn}
        />
      )}
    </Dialog>
  );
}

