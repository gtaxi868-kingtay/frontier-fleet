import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface RecordTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEM_TABLES = [
  { value: 'weapons', label: 'Weapons' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'tools', label: 'Tools' },
  { value: 'engineer_equipment', label: 'Engineer Equipment' },
  { value: 'plant_machinery', label: 'Plant Machinery' },
  { value: 'mechanics_tools', label: 'Mechanics Tools' },
  { value: 'ppe', label: 'PPE' },
  { value: 'uniforms', label: 'Uniforms' },
];

const TRANSACTION_TYPES = [
  { value: 'issue', label: 'Issue' },
  { value: 'return', label: 'Return' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'disposal', label: 'Disposal' },
];

export function RecordTransactionDialog({ open, onOpenChange }: RecordTransactionDialogProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    item_table: '',
    item_id: '',
    transaction_type: '',
    from_user_id: '',
    to_user_id: '',
    quantity: 1,
    condition_issue: '',
    condition_return: '',
    serviceability: '',
    notes: '',
  });

  const { data: items } = useQuery({
    queryKey: ['items-for-transaction', formData.item_table],
    queryFn: async () => {
      if (!formData.item_table) return [];
      
      const { data, error } = await supabase
        .from(formData.item_table as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.item_table,
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-transaction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const recordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const transactionData: any = {
        item_table: data.item_table,
        item_id: data.item_id,
        transaction_type: data.transaction_type,
        quantity: data.quantity,
        issued_by_id: user!.id,
        unit_id: profile?.unit_id || null,
      };

      if (data.from_user_id) transactionData.from_user_id = data.from_user_id;
      if (data.to_user_id) transactionData.to_user_id = data.to_user_id;
      if (data.condition_issue) transactionData.condition_issue = data.condition_issue;
      if (data.condition_return) transactionData.condition_return = data.condition_return;
      if (data.serviceability) transactionData.serviceability = data.serviceability;
      if (data.notes) transactionData.notes = data.notes;

      const { error } = await supabase
        .from('transactions_detailed')
        .insert(transactionData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Transaction Recorded',
        description: 'The transaction has been successfully recorded.',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions-detailed'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      item_table: '',
      item_id: '',
      transaction_type: '',
      from_user_id: '',
      to_user_id: '',
      quantity: 1,
      condition_issue: '',
      condition_return: '',
      serviceability: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_table || !formData.item_id || !formData.transaction_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    recordMutation.mutate(formData);
  };

  const getItemLabel = (item: any) => {
    if (!item) return 'Unknown';
    const label = item.weapon_id || item.vehicle_id || item.tool_id || item.equip_id || 
           item.plant_id || item.ppe_id || item.uniform_id || 
           item.weapon_type || item.vehicle_type || item.tool_name || 
           item.equipment_name || item.type || item.item;
    return label ? String(label) : 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Record an inventory transaction for tracking purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_table">Item Category *</Label>
              <Select value={formData.item_table} onValueChange={(value) => setFormData({ ...formData, item_table: value, item_id: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TABLES.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_id">Item *</Label>
              <Select 
                value={formData.item_id} 
                onValueChange={(value) => setFormData({ ...formData, item_id: value })}
                disabled={!formData.item_table}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items && items.length > 0 ? (
                    items.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {getItemLabel(item)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No items available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type *</Label>
              <Select value={formData.transaction_type} onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_user_id">From User</Label>
              <Select value={formData.from_user_id || undefined} onValueChange={(value) => setFormData({ ...formData, from_user_id: value === '__none__' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.rank} {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_user_id">To User</Label>
              <Select value={formData.to_user_id || undefined} onValueChange={(value) => setFormData({ ...formData, to_user_id: value === '__none__' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.rank} {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition_issue">Condition on Issue</Label>
            <Textarea
              id="condition_issue"
              value={formData.condition_issue}
              onChange={(e) => setFormData({ ...formData, condition_issue: e.target.value })}
              placeholder="Describe condition when issued..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition_return">Condition on Return</Label>
            <Textarea
              id="condition_return"
              value={formData.condition_return}
              onChange={(e) => setFormData({ ...formData, condition_return: e.target.value })}
              placeholder="Describe condition when returned..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceability">Serviceability</Label>
            <Select value={formData.serviceability || undefined} onValueChange={(value) => setFormData({ ...formData, serviceability: value === '__none__' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select serviceability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                <SelectItem value="Serviceable">Serviceable</SelectItem>
                <SelectItem value="Unserviceable">Unserviceable</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordMutation.isPending}>
              {recordMutation.isPending ? 'Recording...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
