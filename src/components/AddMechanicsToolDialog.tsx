import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddMechanicsToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMechanicsToolDialog({ open, onOpenChange, onSuccess }: AddMechanicsToolDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tool_id: "",
    tool_name: "",
    category: "",
    qty_on_hand: "",
    serviceable: true,
    last_inspection_date: "",
    next_inspection_due: "",
    authority: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("mechanics_tools").insert({
        ...formData,
        qty_on_hand: formData.qty_on_hand ? parseInt(formData.qty_on_hand) : 0,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Tool added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        tool_id: "",
        tool_name: "",
        category: "",
        qty_on_hand: "",
        serviceable: true,
        last_inspection_date: "",
        next_inspection_due: "",
        authority: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Mechanics Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tool_id">Tool ID *</Label>
              <Input
                id="tool_id"
                value={formData.tool_id}
                onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tool_name">Tool Name *</Label>
              <Input
                id="tool_name"
                value={formData.tool_name}
                onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hand Tools">Hand Tools</SelectItem>
                  <SelectItem value="Power Tools">Power Tools</SelectItem>
                  <SelectItem value="Diagnostic Equipment">Diagnostic Equipment</SelectItem>
                  <SelectItem value="Lifting Equipment">Lifting Equipment</SelectItem>
                  <SelectItem value="Welding Equipment">Welding Equipment</SelectItem>
                  <SelectItem value="Measuring Tools">Measuring Tools</SelectItem>
                  <SelectItem value="Specialty Tools">Specialty Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qty_on_hand">Quantity on Hand</Label>
              <Input
                id="qty_on_hand"
                type="number"
                value={formData.qty_on_hand}
                onChange={(e) => setFormData({ ...formData, qty_on_hand: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceable">Serviceability</Label>
              <Select 
                value={formData.serviceable ? "true" : "false"} 
                onValueChange={(value) => setFormData({ ...formData, serviceable: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Serviceable</SelectItem>
                  <SelectItem value="false">Unserviceable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="authority">Authority</Label>
              <Input
                id="authority"
                value={formData.authority}
                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                placeholder="e.g., Issue voucher/order number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="last_inspection_date">Last Inspection Date</Label>
              <Input
                id="last_inspection_date"
                type="date"
                value={formData.last_inspection_date}
                onChange={(e) => setFormData({ ...formData, last_inspection_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="next_inspection_due">Next Inspection Due</Label>
              <Input
                id="next_inspection_due"
                type="date"
                value={formData.next_inspection_due}
                onChange={(e) => setFormData({ ...formData, next_inspection_due: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Tool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
