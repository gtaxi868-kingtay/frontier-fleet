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
import { Search, User, Package, CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClothingScale, useClothingScaleCheck } from "@/hooks/useClothingScale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IssueReceipt } from "@/components/IssueReceipt";

interface ClothingEquipmentIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ClothingEquipmentIssueDialog({ open, onOpenChange, onSuccess }: ClothingEquipmentIssueDialogProps) {
  const { profile, role } = useAuth();
  const { checkScaleAvailability } = useClothingScale();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Soldier, 2: Select Item, 3: Scale Check, 4: Review, 5: Complete
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<"clothing" | "equipment" | "necessaries">("clothing");
  const [quantity, setQuantity] = useState(1);
  const [conditionOnIssue, setConditionOnIssue] = useState("Serviceable");
  const [regimentalNumberMarked, setRegimentalNumberMarked] = useState(false);
  const [markingLocation, setMarkingLocation] = useState("");
  const [overrideJustification, setOverrideJustification] = useState("");
  const [scaleCheck, setScaleCheck] = useState<any>(null);
  const [overrideScale, setOverrideScale] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [issuedItemData, setIssuedItemData] = useState<any>(null);

  // Fetch soldiers for search
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-clothing-issue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available scale items for selected soldier's rank
  const { data: scaleItems = [] } = useQuery({
    queryKey: ['scale-items-for-rank', selectedSoldier?.rank],
    queryFn: async () => {
      if (!selectedSoldier?.rank) return [];
      const { data, error } = await supabase
        .from('clothing_equipment_scale')
        .select('*')
        .eq('rank', selectedSoldier.rank)
        .eq('scale_type', 'regular')
        .order('item_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSoldier?.rank,
  });

  // Check scale when soldier and item are selected
  const { data: scaleCheckResult, isLoading: scaleChecking } = useClothingScaleCheck(
    selectedSoldier?.id || null,
    selectedSoldier?.rank || null,
    itemName || null,
    quantity,
    step >= 3 && !!selectedSoldier && !!itemName
  );

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

  // Generate issue number
  const [issueNumber, setIssueNumber] = useState("");
  useEffect(() => {
    if (open && !issueNumber) {
      const timestamp = Date.now().toString().slice(-6);
      setIssueNumber(`CE-${timestamp}`);
    }
  }, [open, issueNumber]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSoldierSearch("");
      setSelectedSoldier(null);
      setItemName("");
      setQuantity(1);
      setConditionOnIssue("Serviceable");
      setRegimentalNumberMarked(false);
      setMarkingLocation("");
      setOverrideJustification("");
      setScaleCheck(null);
      setOverrideScale(false);
      setIssueNumber("");
    }
  }, [open]);

  const handleSoldierSelect = (soldier: any) => {
    setSelectedSoldier(soldier);
    setSoldierSearch("");
    setItemName(""); // Reset item when soldier changes
    setStep(2);
  };

  const handleItemSelect = (selectedItem: string) => {
    setItemName(selectedItem);
    setQuantity(1); // Reset quantity
    setStep(3); // Move to scale check
  };

  const handleContinueAfterScaleCheck = () => {
    if (scaleCheckResult?.allowed || (overrideScale && role === 'S4')) {
      setStep(4); // Move to review
    }
  };

  const handleIssue = async () => {
    if (!selectedSoldier || !itemName) {
      toast.error("Please complete all steps");
      return;
    }

    // Final scale check (if not overridden)
    if (!overrideScale && scaleCheckResult && !scaleCheckResult.allowed) {
      toast.error("Cannot issue: Scale exceeded. Please override if authorized.");
      return;
    }

    setLoading(true);
    try {
      // Create clothing equipment issue record
      const { data: issueData, error: issueError } = await supabase
        .from('clothing_equipment_issues')
        .insert([{
          issue_number: issueNumber,
          soldier_id: selectedSoldier.id,
          item_name: itemName,
          item_category: itemCategory,
          quantity_issued: quantity,
          issue_date: new Date().toISOString().split('T')[0],
          issued_by_id: profile?.id,
          condition_on_issue: conditionOnIssue,
          regimental_number_marked: regimentalNumberMarked,
          marking_location: markingLocation || null,
          notes: overrideScale ? `Scale override: ${overrideJustification}` : null,
        }])
        .select()
        .single();

      if (issueError) throw issueError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: 'clothing_equipment_issues',
          item_id: issueData.id,
          transaction_type: 'issue',
          from_user_id: null,
          to_user_id: selectedSoldier.id,
          quantity: quantity,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          condition_issue: conditionOnIssue,
          notes: overrideScale ? `Scale override approved by ${role}: ${overrideJustification}` : null,
        }]);

      if (transactionError) throw transactionError;

      // Store issue data for receipt
      setIssuedItemData({
        issueNumber,
        itemName,
        quantity,
        soldierName: selectedSoldier.name,
        soldierRank: selectedSoldier.rank || '',
        serviceNumber: selectedSoldier.service_number,
        issuedBy: profile?.name || 'Unknown',
        issuedByRank: profile?.rank || undefined,
        issueDate: new Date().toISOString().split('T')[0],
        condition: conditionOnIssue,
        unitName: selectedSoldier.unit?.name,
      });

      toast.success(`Item issued to ${selectedSoldier.rank} ${selectedSoldier.name}`);
      setReceiptOpen(true);
    } catch (error: any) {
      console.error("Error issuing item:", error);
      toast.error(error.message || "Failed to issue item");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 5) * 100;
  const canOverride = role === 'S4' || role === 'CO';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Clothing & Equipment</DialogTitle>
          <DialogDescription>
            Issue clothing or equipment to a soldier with scale enforcement (TTR Form 21)
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 5</span>
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

        {/* Step 2: Select Item */}
        {step === 2 && selectedSoldier && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="font-medium">Soldier: {selectedSoldier.rank} {selectedSoldier.name}</div>
              <div className="text-sm text-muted-foreground">Rank: {selectedSoldier.rank}</div>
            </div>

            <div>
              <Label htmlFor="item-category">Item Category *</Label>
              <Select value={itemCategory} onValueChange={(value: any) => setItemCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="necessaries">Necessaries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-name">Select Item *</Label>
              {scaleItems.length > 0 ? (
                <Select value={itemName} onValueChange={handleItemSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item from scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {scaleItems.map((scale: any) => (
                      <SelectItem key={scale.id} value={scale.item_name}>
                        {scale.item_name} (Max: {scale.quantity_authorized})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="item-name"
                  placeholder="Enter item name..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              )}
              {scaleItems.length === 0 && selectedSoldier?.rank && (
                <p className="text-xs text-muted-foreground mt-1">
                  No scale defined for {selectedSoldier.rank}. Enter item name manually.
                </p>
              )}
            </div>

            {itemName && (
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSelectedSoldier(null);
                }}
              >
                ← Back
              </Button>
              {itemName && (
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Check Scale →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Scale Check */}
        {step === 3 && selectedSoldier && itemName && (
          <div className="space-y-4">
            {scaleChecking && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Checking scale...</p>
              </div>
            )}

            {scaleCheckResult && !scaleChecking && (
              <>
                <Alert variant={scaleCheckResult.allowed ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {scaleCheckResult.allowed ? "Scale Check Passed" : "Scale Exceeded"}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span>Current Holdings:</span>
                        <span className="font-medium">{scaleCheckResult.current}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum Authorized:</span>
                        <span className="font-medium">{scaleCheckResult.max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After This Issue:</span>
                        <span className="font-medium">{scaleCheckResult.current + quantity}</span>
                      </div>
                      {scaleCheckResult.warning && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm">{scaleCheckResult.warning}</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                {!scaleCheckResult.allowed && canOverride && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="override-scale"
                        checked={overrideScale}
                        onCheckedChange={(checked) => setOverrideScale(!!checked)}
                      />
                      <Label htmlFor="override-scale" className="font-medium">
                        Override Scale Limit (S4/CO Only)
                      </Label>
                    </div>
                    {overrideScale && (
                      <div>
                        <Label htmlFor="override-justification">Justification *</Label>
                        <Textarea
                          id="override-justification"
                          placeholder="Explain why this override is necessary..."
                          value={overrideJustification}
                          onChange={(e) => setOverrideJustification(e.target.value)}
                          required={overrideScale}
                        />
                      </div>
                    )}
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
                    onClick={handleContinueAfterScaleCheck}
                    disabled={!scaleCheckResult.allowed && !overrideScale}
                    className="flex-1"
                  >
                    Continue →
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Review & Additional Details */}
        {step === 4 && selectedSoldier && itemName && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <Label className="text-sm font-medium">Issue Number:</Label>
                <div className="font-medium">{issueNumber}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Soldier:</Label>
                <div>{selectedSoldier.rank} {selectedSoldier.name}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Item:</Label>
                <div>{itemName}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity:</Label>
                <div>{quantity}</div>
              </div>
              {scaleCheckResult && (
                <div>
                  <Label className="text-sm font-medium">Scale Status:</Label>
                  <div className="flex items-center gap-2">
                    {scaleCheckResult.allowed ? (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Within Scale ({scaleCheckResult.current + quantity}/{scaleCheckResult.max})
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Override Approved
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="condition">Condition on Issue *</Label>
              <Select value={conditionOnIssue} onValueChange={setConditionOnIssue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Serviceable">Serviceable</SelectItem>
                  <SelectItem value="Unserviceable">Unserviceable</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="regimental-number-marked"
                checked={regimentalNumberMarked}
                onCheckedChange={(checked) => setRegimentalNumberMarked(!!checked)}
              />
              <Label htmlFor="regimental-number-marked">Regimental Number Marked</Label>
            </div>

            {regimentalNumberMarked && (
              <div>
                <Label htmlFor="marking-location">Marking Location</Label>
                <Input
                  id="marking-location"
                  placeholder="E.g., Waistband, Pocket, etc."
                  value={markingLocation}
                  onChange={(e) => setMarkingLocation(e.target.value)}
                />
              </div>
            )}

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
                Review & Issue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Final Review & Confirm */}
        {step === 5 && selectedSoldier && itemName && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ready to Issue</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Review all details below and click "Confirm Issue" to complete
              </p>
            </div>

            <div className="space-y-2 text-sm border p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Number:</span>
                <span className="font-medium">{issueNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soldier:</span>
                <span className="font-medium">{selectedSoldier.rank} {selectedSoldier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">{itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{itemCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">{conditionOnIssue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regimental Number Marked:</span>
                <span className="font-medium">{regimentalNumberMarked ? "Yes" : "No"}</span>
              </div>
              {scaleCheckResult && !scaleCheckResult.allowed && overrideScale && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scale Override:</span>
                  <span className="font-medium text-amber-600">Yes</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(4)}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleIssue}
                disabled={loading || (!scaleCheckResult?.allowed && !overrideScale)}
                className="flex-1"
              >
                {loading ? "Issuing..." : "✓ Confirm Issue"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Receipt Dialog */}
      {issuedItemData && (
        <IssueReceipt
          open={receiptOpen}
          onOpenChange={(open) => {
            setReceiptOpen(open);
            if (!open) {
              // Close main dialog and reset when receipt closes
              onOpenChange(false);
              onSuccess();
              setStep(1);
              setSelectedSoldier(null);
              setSoldierSearch("");
              setItemName("");
              setQuantity(1);
              setConditionOnIssue("Serviceable");
              setRegimentalNumberMarked(false);
              setMarkingLocation("");
              setOverrideJustification("");
              setScaleCheck(null);
              setOverrideScale(false);
              setIssueNumber("");
              setIssuedItemData(null);
            }
          }}
          issueData={issuedItemData}
        />
      )}
    </Dialog>
  );
}

