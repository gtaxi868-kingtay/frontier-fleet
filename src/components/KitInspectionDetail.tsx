import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface KitInspectionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: any;
  onUpdate: () => void;
}

export function KitInspectionDetail({ open, onOpenChange, inspection, onUpdate }: KitInspectionDetailProps) {
  const { profile } = useAuth();
  const [markingComplete, setMarkingComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!inspection) return null;

  const handleMarkFollowUpComplete = async () => {
    if (!inspection) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('kit_inspections')
        .update({ follow_up_completed: true })
        .eq('id', inspection.id);

      if (error) throw error;
      toast.success("Follow-up marked as completed");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update inspection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kit Inspection Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Inspection Date:</Label>
              <div className="font-medium">{format(new Date(inspection.inspection_date), 'dd MMM yyyy')}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Soldier:</Label>
              <div className="font-medium">
                {inspection.soldier?.rank || ''} {inspection.soldier?.name || 'N/A'}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Inspector:</Label>
              <div className="font-medium">
                {inspection.inspector_rank || ''} {inspection.inspector?.name || 'N/A'}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Unit:</Label>
              <div className="font-medium">{inspection.unit?.name || 'N/A'}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{inspection.items_at_scale || 0}</div>
              <div className="text-sm text-muted-foreground">At Scale</div>
            </div>
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{inspection.items_below_scale || 0}</div>
              <div className="text-sm text-muted-foreground">Below Scale</div>
            </div>
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{inspection.items_exceeding_scale || 0}</div>
              <div className="text-sm text-muted-foreground">Exceeding Scale</div>
            </div>
          </div>

          {inspection.deficiencies && inspection.deficiencies.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Deficiencies:</Label>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {inspection.deficiencies.map((def: string, idx: number) => (
                  <li key={idx} className="text-sm">{def}</li>
                ))}
              </ul>
            </div>
          )}

          {inspection.exchange_requests && inspection.exchange_requests.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Exchange Requests:</Label>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {inspection.exchange_requests.map((req: string, idx: number) => (
                  <li key={idx} className="text-sm">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {inspection.serviceability_focus && (
            <div>
              <Label className="text-sm font-medium">Serviceability Assessment:</Label>
              <p className="text-sm mt-2 p-3 bg-muted rounded-lg">{inspection.serviceability_focus}</p>
            </div>
          )}

          {inspection.inspection_notes && (
            <div>
              <Label className="text-sm font-medium">Inspection Notes:</Label>
              <p className="text-sm mt-2 p-3 bg-muted rounded-lg">{inspection.inspection_notes}</p>
            </div>
          )}

          {inspection.follow_up_required && !inspection.follow_up_completed && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="mark-complete"
                  checked={markingComplete}
                  onCheckedChange={(checked) => setMarkingComplete(!!checked)}
                />
                <Label htmlFor="mark-complete">Mark follow-up as completed</Label>
              </div>
              {markingComplete && (
                <Button
                  onClick={handleMarkFollowUpComplete}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Updating..." : "Confirm Follow-up Complete"}
                </Button>
              )}
            </div>
          )}

          {inspection.follow_up_completed && (
            <div className="border-t pt-4">
              <Badge variant="default">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Follow-up Completed
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

