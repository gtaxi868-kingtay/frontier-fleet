import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Car, Gauge, Fuel, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface WorkTicketReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  ticket: any; // Work ticket to return
}

export function WorkTicketReturnDialog({ open, onOpenChange, onSuccess, ticket }: WorkTicketReturnDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review Ticket, 2: Enter Return Data, 3: Confirm
  const [formData, setFormData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    return_time: new Date().toTimeString().slice(0, 5),
    mileage_end: "",
    petrol_remaining: "",
    condition_on_return: "Good",
    notes: "",
  });

  // Calculate distance and consumption
  const mileageStart = ticket?.mileage_start || 0;
  const mileageEnd = parseInt(formData.mileage_end) || mileageStart;
  const distanceTraveled = mileageEnd > mileageStart ? mileageEnd - mileageStart : 0;
  const petrolIssued = parseFloat(String(ticket?.fuel_issued || 0));
  const petrolRemaining = parseFloat(formData.petrol_remaining || '0');
  const petrolConsumed = petrolIssued > 0 && petrolRemaining >= 0 ? petrolIssued - petrolRemaining : 0;
  const mpgCalculated = distanceTraveled > 0 && petrolConsumed > 0 
    ? (distanceTraveled / (petrolConsumed / 3.78541)).toFixed(2) // Convert liters to gallons for MPG
    : null; // MPG calculation (km/L to MPG)

  useEffect(() => {
    if (open && ticket) {
      setStep(1);
      setFormData({
        return_date: new Date().toISOString().split('T')[0],
        return_time: new Date().toTimeString().slice(0, 5),
        mileage_end: "",
        petrol_remaining: "",
        condition_on_return: "Good",
        notes: "",
      });
    }
  }, [open, ticket]);

  const validateStep2 = () => {
    if (!formData.mileage_end) {
      toast.error("Please enter ending mileage");
      return false;
    }
    const endMileage = parseInt(formData.mileage_end);
    if (isNaN(endMileage)) {
      toast.error("Mileage must be a number");
      return false;
    }
    if (endMileage < mileageStart) {
      toast.error(`Ending mileage (${endMileage}) cannot be less than starting mileage (${mileageStart})`);
      return false;
    }
    return true;
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      if (!ticket || ticket.status !== 'active') {
        toast.error("This work ticket is not active or cannot be returned");
        return;
      }

      const endMileage = parseInt(formData.mileage_end);
      const totalDistance = endMileage - mileageStart;
      
      // Update work ticket status to completed
      const { error: ticketError } = await supabase
        .from('mt_work_tickets')
        .update({
          status: 'completed',
          return_date: formData.return_date,
          return_time: formData.return_time,
          mileage_end: endMileage,
          mileage_total: totalDistance,
          condition_on_return: formData.condition_on_return,
          notes: formData.notes || null,
        })
        .eq('id', ticket.id);

      if (ticketError) throw ticketError;

      // Create POL transaction entry if petrol was issued
      if (petrolIssued > 0) {
        const petrolConsumedValue = petrolConsumed > 0 ? petrolConsumed : 0;
        
        const polData = {
          fuel_type: 'petrol',
          quantity: petrolConsumedValue,
          transaction_type: 'issue',
          vehicle_id: ticket.vehicle_id,
          work_ticket_id: ticket.id,
          transaction_date: new Date().toISOString().split('T')[0],
          authorized_by: profile?.id,
          squadron_id: ticket.squadron_id,
          notes: `Work ticket ${ticket.ticket_number} - Consumed ${petrolConsumedValue}L`,
        };

        const { error: polError } = await supabase
          .from('pol_transactions')
          .insert([polData]);

        if (polError) {
          console.error('POL transaction creation error:', polError);
          // Don't fail the return if POL creation fails - just log it
          toast.warning("Work ticket returned, but POL tracking had an issue");
        }
      }

      // Update vehicle availability (mark as available again)
      if (ticket.vehicle_id) {
        // Update vehicle mileage if provided
        const vehicleUpdate: any = {};
        if (endMileage > mileageStart) {
          vehicleUpdate.mileage = endMileage;
        }
        
        // Only update if there's something to update
        if (Object.keys(vehicleUpdate).length > 0) {
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update(vehicleUpdate)
            .eq('id', ticket.vehicle_id);

          if (vehicleError) {
            console.error('Vehicle update error:', vehicleError);
            // Don't fail the return if vehicle update fails
          }
        }
      }

      toast.success("Work ticket returned successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to return work ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return null;
  }

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Return Work Ticket</DialogTitle>
          <DialogDescription>
            Complete vehicle return and reconciliation in 3 simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Review Ticket */}
        {step === 1 && (
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Ticket Number:</Label>
                    <Badge variant="outline" className="font-mono">{ticket.ticket_number}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Vehicle:</Label>
                    <span className="font-medium">
                      {ticket.vehicle?.vehicle_id || 'N/A'} - {ticket.vehicle?.vehicle_type || ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Driver:</Label>
                    <span className="font-medium">
                      {ticket.driver?.rank || ''} {ticket.driver?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Destination:</Label>
                    <span>{ticket.destination}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Issue Date:</Label>
                    <span>{ticket.issue_date}</span>
                  </div>
                  {ticket.mileage_start && (
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Starting Mileage:
                      </Label>
                      <span className="font-medium">{ticket.mileage_start} km</span>
                    </div>
                  )}
                  {ticket.petrol_issued && (
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        Petrol Issued:
                      </Label>
                      <span className="font-medium">{ticket.petrol_issued} L</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full"
            >
              Continue to Return Data →
            </Button>
          </div>
        )}

        {/* Step 2: Enter Return Data */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="return_date">Return Date *</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_time">Return Time</Label>
                <Input
                  id="return_time"
                  type="time"
                  value={formData.return_time}
                  onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mileage_end" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Ending Mileage (km) *
                </Label>
                <Input
                  id="mileage_end"
                  type="number"
                  value={formData.mileage_end}
                  onChange={(e) => setFormData({ ...formData, mileage_end: e.target.value })}
                  placeholder={mileageStart.toString()}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Starting: {mileageStart} km
                </p>
                {distanceTraveled > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Distance traveled: {distanceTraveled} km
                  </p>
                )}
              </div>
              {ticket.petrol_issued && (
                <div>
                  <Label htmlFor="petrol_remaining" className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Petrol Remaining (L)
                  </Label>
                  <Input
                    id="petrol_remaining"
                    type="number"
                    step="0.01"
                    value={formData.petrol_remaining}
                    onChange={(e) => setFormData({ ...formData, petrol_remaining: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued: {petrolIssued} L
                  </p>
                  {petrolConsumed > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Consumed: {petrolConsumed.toFixed(2)} L
                    </p>
                  )}
                  {mpgCalculated && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      MPG: {mpgCalculated}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="condition_on_return">Vehicle Condition on Return</Label>
              <Select
                value={formData.condition_on_return}
                onValueChange={(value) => setFormData({ ...formData, condition_on_return: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent - No issues</SelectItem>
                  <SelectItem value="Good">Good - Minor wear</SelectItem>
                  <SelectItem value="Fair">Fair - Some issues noted</SelectItem>
                  <SelectItem value="Poor">Poor - Needs inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any issues, damage, or observations..."
              />
            </div>

            {(parseInt(formData.mileage_end) < mileageStart && formData.mileage_end) && (
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Invalid Mileage</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Ending mileage cannot be less than starting mileage ({mileageStart} km)
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (validateStep2()) {
                    setStep(3);
                  }
                }}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ready to Return</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Review the summary below and click "Return Vehicle" to complete
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket:</span>
                    <span className="font-medium">{ticket.ticket_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="font-medium">{ticket.vehicle?.vehicle_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Date:</span>
                    <span className="font-medium">{formData.return_date} {formData.return_time && `at ${formData.return_time}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance Traveled:</span>
                    <span className="font-medium">{distanceTraveled} km</span>
                  </div>
                  {petrolIssued > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Petrol Consumed:</span>
                        <span className="font-medium">{petrolConsumed.toFixed(2)} L</span>
                      </div>
                      {mpgCalculated && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MPG:</span>
                          <span className="font-medium">{mpgCalculated}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <Badge variant="outline">{formData.condition_on_return}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleReturn}
                disabled={loading || !formData.mileage_end}
                className="flex-1"
              >
                {loading ? "Returning..." : "✓ Return Vehicle"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

