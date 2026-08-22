import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, User, CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClothingScale } from "@/hooks/useClothingScale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

interface KitInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ItemCheck {
  itemName: string;
  currentQty: number;
  authorizedQty: number;
  status: 'at_scale' | 'below_scale' | 'exceeding_scale';
  isDeficient: boolean;
  exchangeRequested: boolean;
}

export function KitInspectionDialog({ open, onOpenChange, onSuccess }: KitInspectionDialogProps) {
  const { profile } = useAuth();
  const { getSoldierHoldings, getScaleForRank } = useClothingScale();
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorRank, setInspectorRank] = useState("");
  const [soldierHoldings, setSoldierHoldings] = useState<any[]>([]);
  const [itemChecks, setItemChecks] = useState<ItemCheck[]>([]);
  const [deficiencies, setDeficiencies] = useState<string[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<string[]>([]);
  const [serviceabilityFocus, setServiceabilityFocus] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);

  // Fetch soldiers for search
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-inspection', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit_id, unit:units(name)')
        .order('name');

      // Apply unit filter if user can't see all units
      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Filter soldiers based on search
  const filteredSoldiers = soldiers.filter((s: any) => {
    if (!soldierSearch) return false;
    const searchLower = soldierSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(searchLower) ||
      s.rank?.toLowerCase().includes(searchLower) ||
      s.service_number?.toLowerCase().includes(searchLower)
    );
  });

  // Load soldier holdings and check against scale
  const loadSoldierHoldings = async (soldier: any) => {
    try {
      const holdings = await getSoldierHoldings(soldier.id);
      setSoldierHoldings(holdings);

      // Get scale for soldier's rank (handle missing rank gracefully)
      let scale: any[] = [];
      
      if (!soldier.rank) {
        // No rank - create checks from holdings only without scale comparison
        toast.warning("Soldier has no rank assigned. Scale comparison unavailable. Please update soldier profile with rank.");
        const checks: ItemCheck[] = holdings.map((issue: any) => ({
          itemName: issue.item_name,
          currentQty: issue.quantity_issued || 1,
          authorizedQty: 0,
          status: 'at_scale' as const,
          isDeficient: false,
          exchangeRequested: false,
        }));
        setItemChecks(checks);
        return;
      }

      try {
        scale = await getScaleForRank(soldier.rank);
      } catch (scaleError: any) {
        console.warn("Error fetching scale:", scaleError);
        // Continue with holdings only if scale fetch fails
        toast.warning(`Could not load scale for rank ${soldier.rank}. Showing holdings only.`);
      }
      
      // Create item checks
      const checks: ItemCheck[] = [];
      const itemGroups = new Map<string, { current: number; scale: number }>();

      // Group holdings by item name
      holdings.forEach((issue: any) => {
        const itemName = issue.item_name;
        const current = itemGroups.get(itemName) || { current: 0, scale: 0 };
        current.current += issue.quantity_issued || 1;
        itemGroups.set(itemName, current);
      });

      // Get authorized quantities from scale (handle missing scale gracefully)
      if (scale && scale.length > 0) {
        scale.forEach((scaleItem: any) => {
          const itemName = scaleItem.item_name;
          const current = itemGroups.get(itemName);
          if (current) {
            current.scale = scaleItem.quantity_authorized || 0;
          } else {
            itemGroups.set(itemName, { current: 0, scale: scaleItem.quantity_authorized || 0 });
          }
        });
      }

      // Create checks for all items (both holdings and scale items)
      const allItems = new Set([
        ...holdings.map((h: any) => h.item_name), 
        ...(scale || []).map((s: any) => s.item_name)
      ]);
      
      allItems.forEach((itemName) => {
        const group = itemGroups.get(itemName) || { current: 0, scale: 0 };
        let status: 'at_scale' | 'below_scale' | 'exceeding_scale' = 'at_scale';
        
        // Only compare if scale is defined (scale > 0)
        if (group.scale > 0) {
          if (group.current < group.scale) status = 'below_scale';
          if (group.current > group.scale) status = 'exceeding_scale';
        } else {
          // No scale defined - mark as at_scale but show note
          status = 'at_scale';
        }

        checks.push({
          itemName,
          currentQty: group.current,
          authorizedQty: group.scale || 0,
          status,
          isDeficient: group.scale > 0 && group.current < group.scale,
          exchangeRequested: false,
        });
      });

      setItemChecks(checks);
    } catch (error: any) {
      console.error("Error loading holdings:", error);
      toast.error("Failed to load soldier holdings: " + (error.message || "Unknown error"));
      // Set empty checks to prevent component crash
      setItemChecks([]);
    }
  };

  const handleSoldierSelect = async (soldier: any) => {
    if (!soldier.rank) {
      toast.warning("Soldier has no rank assigned. Some features may be limited. Please update the soldier's profile.");
    }
    setSelectedSoldier(soldier);
    setSoldierSearch("");
    setInspectorRank(profile?.rank || "");
    await loadSoldierHoldings(soldier);
    setStep(2);
  };

  const toggleDeficiency = (itemName: string) => {
    if (deficiencies.includes(itemName)) {
      setDeficiencies(deficiencies.filter(d => d !== itemName));
    } else {
      setDeficiencies([...deficiencies, itemName]);
    }
  };

  const toggleExchangeRequest = (itemName: string) => {
    if (exchangeRequests.includes(itemName)) {
      setExchangeRequests(exchangeRequests.filter(e => e !== itemName));
    } else {
      setExchangeRequests([...exchangeRequests, itemName]);
    }
    // Also update item check
    setItemChecks(itemChecks.map(check => 
      check.itemName === itemName 
        ? { ...check, exchangeRequested: !check.exchangeRequested }
        : check
    ));
  };

  const handleSubmit = async () => {
    if (!selectedSoldier || !inspectionDate) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      const itemsAtScale = itemChecks.filter(c => c.status === 'at_scale').length;
      const itemsBelowScale = itemChecks.filter(c => c.status === 'below_scale').length;
      const itemsExceedingScale = itemChecks.filter(c => c.status === 'exceeding_scale').length;

      const { data: inspectionData, error } = await supabase
        .from('kit_inspections')
        .insert([{
          inspection_date: inspectionDate,
          soldier_id: selectedSoldier.id,
          unit_id: selectedSoldier.unit_id || profile?.unit_id,
          inspected_by_id: profile?.id,
          inspector_rank: inspectorRank || profile?.rank,
          items_at_scale: itemsAtScale,
          items_below_scale: itemsBelowScale,
          items_exceeding_scale: itemsExceedingScale,
          deficiencies: deficiencies,
          exchange_requests: exchangeRequests,
          serviceability_focus: serviceabilityFocus || null,
          inspection_notes: inspectionNotes || null,
          follow_up_required: followUpRequired,
        }])
        .select()
        .single();

      if (error) throw error;

      // If there are exchange requests, offer to create monthly exchanges
      if (exchangeRequests.length > 0 && inspectionData) {
        // Get soldier's current issues for the items that need exchange
        try {
          const { data: soldierIssues } = await supabase
            .from('clothing_equipment_issues')
            .select('id, item_name, issue_number')
            .eq('soldier_id', selectedSoldier.id)
            .in('item_name', exchangeRequests)
            .is('return_date', null); // Only active issues

          if (soldierIssues && soldierIssues.length > 0) {
            // Group by item name
            const issuesByItem = soldierIssues.reduce((acc: Record<string, any[]>, issue: any) => {
              if (!acc[issue.item_name]) acc[issue.item_name] = [];
              acc[issue.item_name].push(issue);
              return acc;
            }, {});

            // Create monthly exchanges for each item type
            const exchangePromises = Object.entries(issuesByItem).map(async ([itemName, issues]) => {
              const issueIds = issues.map((i: any) => i.id);
              const exchangeMonth = new Date(inspectionDate).toISOString().slice(0, 7) + '-01';
              
              const { error: exchangeError } = await supabase
                .from('clothing_exchanges')
                .insert([{
                  exchange_month: exchangeMonth,
                  unit_id: selectedSoldier.unit_id || profile?.unit_id,
                  item_name: itemName,
                  quantity_exchanged: issueIds.length,
                  exchange_reason: 'unserviceable', // Default reason from inspection
                  items_handed_in: issueIds,
                  items_issued: [],
                  exchange_date: inspectionDate,
                  processed_by_id: profile?.id,
                  qm_reviewed: false,
                  qm_approved: false,
                  notes: `Auto-created from kit inspection ${inspectionData.id} for ${selectedSoldier.rank} ${selectedSoldier.name}`,
                }]);

              if (exchangeError) {
                console.error(`Error creating exchange for ${itemName}:`, exchangeError);
                // Don't throw - continue with other items
              }
            });

            await Promise.all(exchangePromises);
            toast.success(
              `Kit inspection recorded. ${Object.keys(issuesByItem).length} monthly exchange(s) created from exchange requests.`
            );
          } else {
            toast.success(
              `Kit inspection recorded. ${exchangeRequests.length} exchange request(s) noted, but no active issues found to exchange.`
            );
          }
        } catch (exchangeError: any) {
          console.error('Error creating exchanges from inspection:', exchangeError);
          // Don't fail the inspection if exchange creation fails
          toast.success(
            `Kit inspection recorded. Note: Could not auto-create exchanges (${exchangeError.message}). Please create manually.`
          );
        }
      } else {
        toast.success(`Kit inspection recorded for ${selectedSoldier.rank} ${selectedSoldier.name}`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error recording inspection:", error);
      const errorMessage = error.message || "Failed to record kit inspection";
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('You do not have permission to record kit inspections.');
      } else if (errorMessage.includes('required') || errorMessage.includes('null')) {
        toast.error('Please complete all required fields.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSoldierSearch("");
      setSelectedSoldier(null);
      setInspectionDate(new Date().toISOString().split('T')[0]);
      setInspectorRank("");
      setSoldierHoldings([]);
      setItemChecks([]);
      setDeficiencies([]);
      setExchangeRequests([]);
      setServiceabilityFocus("");
      setInspectionNotes("");
      setFollowUpRequired(false);
    }
  }, [open]);

  const progress = (step / 6) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kit Inspection</DialogTitle>
          <DialogDescription>
            Record monthly kit inspection (Coy 2IC or Platoon Commander)
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 6</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Select Soldier */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="soldier-search" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Search for Soldier
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="soldier-search"
                  placeholder="Type name, rank, or service number..."
                  className="pl-9"
                  value={soldierSearch}
                  onChange={(e) => setSoldierSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {soldierSearch && filteredSoldiers.length > 0 && (
                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                  {filteredSoldiers.slice(0, 5).map((soldier: any) => (
                    <button
                      key={soldier.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0"
                      onClick={() => handleSoldierSelect(soldier)}
                    >
                      <div className="font-medium">{soldier.rank} {soldier.name}</div>
                      {soldier.unit?.name && (
                        <div className="text-sm text-muted-foreground">{soldier.unit.name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {soldierSearch && filteredSoldiers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No soldiers found</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Inspection Date & Inspector */}
        {step === 2 && selectedSoldier && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="font-medium">Soldier: {selectedSoldier.rank} {selectedSoldier.name}</div>
              <div className="text-sm text-muted-foreground">Rank: {selectedSoldier.rank}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspection-date">Inspection Date *</Label>
                <Input
                  id="inspection-date"
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="inspector-rank">Inspector Rank *</Label>
                <Input
                  id="inspector-rank"
                  value={inspectorRank}
                  onChange={(e) => setInspectorRank(e.target.value)}
                  placeholder={profile?.rank || "Enter rank"}
                  required
                />
              </div>
            </div>

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
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Item Checklist */}
        {step === 3 && selectedSoldier && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Item Scale Check</AlertTitle>
              <AlertDescription>
                Review each item against authorized scale. Mark deficiencies and exchange requests.
              </AlertDescription>
            </Alert>

            {itemChecks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                No current holdings or authorized scale items found for this soldier.
              </p>
            )}

            {itemChecks.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded-lg">
              {itemChecks.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{check.itemName}</div>
                    <div className="text-sm text-muted-foreground">
                      Current: {check.currentQty} | Authorized: {check.authorizedQty || 'Not specified'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      check.status === 'at_scale' ? 'default' :
                      check.status === 'below_scale' ? 'destructive' : 'secondary'
                    }>
                      {check.status === 'at_scale' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {check.status === 'below_scale' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {check.status === 'exceeding_scale' && <XCircle className="h-3 w-3 mr-1" />}
                      {check.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`deficient-${idx}`}
                          checked={deficiencies.includes(check.itemName)}
                          onCheckedChange={() => toggleDeficiency(check.itemName)}
                        />
                        <Label htmlFor={`deficient-${idx}`} className="text-xs">Deficient</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`exchange-${idx}`}
                          checked={exchangeRequests.includes(check.itemName)}
                          onCheckedChange={() => toggleExchangeRequest(check.itemName)}
                        />
                        <Label htmlFor={`exchange-${idx}`} className="text-xs">Exchange</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Serviceability Focus */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceability-focus">Serviceability Assessment</Label>
              <Textarea
                id="serviceability-focus"
                placeholder="Notes on serviceability of items, condition assessment..."
                value={serviceabilityFocus}
                onChange={(e) => setServiceabilityFocus(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Notes & Follow-up */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="inspection-notes">Inspection Notes</Label>
              <Textarea
                id="inspection-notes"
                placeholder="Additional observations, recommendations..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow-up-required"
                checked={followUpRequired}
                onCheckedChange={(checked) => setFollowUpRequired(!!checked)}
              />
              <Label htmlFor="follow-up-required">Follow-up Required</Label>
            </div>

            {deficiencies.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Deficiencies Identified</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {deficiencies.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {exchangeRequests.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Exchange Requests</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {exchangeRequests.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(4)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(6)}
                className="flex-1"
              >
                Review →
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {step === 6 && selectedSoldier && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Review Inspection</AlertTitle>
              <AlertDescription>
                Review all details before submitting the inspection record.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 border p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Soldier:</Label>
                  <div className="font-medium">{selectedSoldier.rank} {selectedSoldier.name}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Inspection Date:</Label>
                  <div className="font-medium">{format(new Date(inspectionDate), 'dd MMM yyyy')}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Inspector:</Label>
                  <div className="font-medium">{inspectorRank || profile?.rank}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Items at Scale:</Label>
                  <div className="font-medium">{itemChecks.filter(c => c.status === 'at_scale').length}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Items Below Scale:</Label>
                  <div className="font-medium text-destructive">{itemChecks.filter(c => c.status === 'below_scale').length}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Deficiencies:</Label>
                  <div className="font-medium">{deficiencies.length}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(5)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "✓ Submit Inspection"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

