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

interface AddUniformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUniformDialog({ open, onOpenChange, onSuccess }: AddUniformDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uniform_id: "",
    item_name: "",
    size: "",
    serviceable: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("uniforms").insert({
        ...formData,
        squadron_id: profile?.unit_id,
      });

      if (error) throw error;

      toast.success("Uniform added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        uniform_id: "",
        item_name: "",
        size: "",
        serviceable: true,
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
          <DialogTitle>Add Uniform</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uniform_id">Uniform ID *</Label>
              <Input
                id="uniform_id"
                value={formData.uniform_id}
                onChange={(e) => setFormData({ ...formData, uniform_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="item_name">Item Name *</Label>
              <Select value={formData.item_name} onValueChange={(value) => setFormData({ ...formData, item_name: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Combat Uniform">Combat Uniform</SelectItem>
                  <SelectItem value="Dress Uniform">Dress Uniform</SelectItem>
                  <SelectItem value="PT Uniform">PT Uniform</SelectItem>
                  <SelectItem value="Boots">Boots</SelectItem>
                  <SelectItem value="Cap">Cap</SelectItem>
                  <SelectItem value="Belt">Belt</SelectItem>
                  <SelectItem value="Jacket">Jacket</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size">Size</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? "Adding..." : "Add Uniform"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
