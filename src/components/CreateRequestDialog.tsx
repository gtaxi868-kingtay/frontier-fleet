import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEM_TYPES = [
  'weapons',
  'vehicles',
  'tools',
  'engineer_equipment',
  'plant_machinery',
  'mechanics_tools',
  'ppe',
  'uniforms',
  'general_inventory',
  'works_materials',
];

const REQUEST_TYPES = [
  { value: 'new_item', label: 'New Item' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'additional', label: 'Additional Quantity' },
];

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    request_type: 'new_item',
    item_type: '',
    item_name: '',
    quantity: 1,
    specifications: '',
    justification: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('inventory_requests').insert([{
        requester_id: user!.id,
        requester_role: role as any,
        unit_id: profile?.unit_id,
        request_type: data.request_type,
        item_type: data.item_type,
        item_name: data.item_name,
        quantity: data.quantity,
        specifications: data.specifications,
        justification: data.justification,
        status: 'pending',
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request Submitted',
        description: 'Your inventory request has been submitted for approval.',
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-requests'] });
      onOpenChange(false);
      setFormData({
        request_type: 'new_item',
        item_type: '',
        item_name: '',
        quantity: 1,
        specifications: '',
        justification: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_type || !formData.justification) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Inventory Request</DialogTitle>
          <DialogDescription>
            Submit a request for new inventory items or replacements. Requests will be reviewed by S4/CO.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select 
                value={formData.request_type} 
                onValueChange={(value) => setFormData({ ...formData, request_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_type">Item Category *</Label>
              <Select 
                value={formData.item_type} 
                onValueChange={(value) => setFormData({ ...formData, item_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="E.g., M4 Carbine, Bulldozer, Hard Hat"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications">Specifications</Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder="Technical specifications, model numbers, size requirements, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Explain why this item is needed, operational requirements, etc."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
