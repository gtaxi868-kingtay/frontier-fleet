import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Package, CheckCircle2, AlertCircle, Printer, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IssueReceipt } from "@/components/IssueReceipt";
import { useClothingScaleCheck } from "@/hooks/useClothingScale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateQuantity } from "@/lib/validation";

interface QuickIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any; // Pre-selected item
  module: string; // 'tools', 'weapons', 'uniforms', etc.
}

interface QtyFieldConfig {
  availableField: string; // column checked against the requested quantity
  onHandField?: string; // column decremented on issue (omit if the module has no live balance to decrement)
  issuedField: string; // column incremented on issue
  computeAvailable?: (item: any) => number; // overrides availableField when the "available" figure is derived, not stored directly
}

const DEFAULT_QTY_CONFIG: QtyFieldConfig = {
  availableField: 'qty_on_hand',
  onHandField: 'qty_on_hand',
  issuedField: 'qty_issued',
};

// Bulk consumable-stock ledgers use different column names than the per-unit
// modules (tools/uniforms/ppe/mechanics_tools) the dialog was originally built
// for. Add an entry here for any module whose columns don't match the default.
const QTY_FIELD_CONFIG: Record<string, QtyFieldConfig> = {
  general_inventory: {
    availableField: 'qty_on_hand',
    onHandField: 'qty_on_hand',
    issuedField: 'qty_issued_monthly',
  },
  works_materials: {
    // works_materials has no live "on hand" balance - quantity_received is a
    // running historical total that never gets decremented. "Available" is
    // derived, and only quantity_issued moves on an issue.
    availableField: 'quantity_received',
    issuedField: 'quantity_issued',
    computeAvailable: (item: any) => (item?.quantity_received ?? 0) - (item?.quantity_issued ?? 0),
  },
};

export function QuickIssueDialog({ open, onOpenChange, onSuccess, item, module }: QuickIssueDialogProps) {
  const { profile, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Find Soldier, 2: Review, 3: Complete
  const [soldierSearch, setSoldierSearch] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [issueNumber, setIssueNumber] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [issuedItemData, setIssuedItemData] = useState<any>(null);

  // Determine if this is a clothing-related module
  const isClothingModule = module === 'uniforms' || module === 'clothing_equipment_issues';

  // Get item name for scale checking
  const itemName = item?.item_name || item?.item || item?.tool_name || item?.material || null;

  // Bulk stock ledgers (general_inventory, works_materials) use different column
  // names than the per-unit modules (tools/uniforms/ppe use qty_on_hand/qty_issued).
  // This config lets the same dialog issue against either shape without touching
  // the default behavior those modules already rely on.
  const qtyConfig = QTY_FIELD_CONFIG[module] || DEFAULT_QTY_CONFIG;
  const availableQty = qtyConfig.computeAvailable ? qtyConfig.computeAvailable(item) : item?.[qtyConfig.availableField];
  
  // Check scale if clothing item and soldier selected
  const { data: scaleCheckResult } = useClothingScaleCheck(
    selectedSoldier?.id || null,
    selectedSoldier?.rank || null,
    itemName,
    quantity,
    isClothingModule && step >= 2 && !!selectedSoldier && !!itemName
  );

  // Check if scale check should block issue
  const scaleBlocked = isClothingModule && scaleCheckResult && !scaleCheckResult.allowed;
  const scaleWarning = isClothingModule && scaleCheckResult && scaleCheckResult.warning && scaleCheckResult.allowed;

  // Fetch soldiers for search
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-issue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, rank, service_number, unit:units(name)')
        .order('name');
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

  // Generate issue number when dialog opens
  useEffect(() => {
    if (open && !issueNumber) {
      const timestamp = Date.now().toString().slice(-6);
      setIssueNumber(`${module.toUpperCase()}-${timestamp}`);
    }
  }, [open, module, issueNumber]);

  const handleIssue = async () => {
    if (!selectedSoldier || !item) {
      toast.error("Please complete all steps");
      return;
    }

    // Validate quantity
    const quantityValidation = validateQuantity(quantity);
    if (!quantityValidation.valid) {
      toast.error(quantityValidation.error || "Invalid quantity");
      return;
    }

    // Check available quantity
    if (availableQty !== undefined && quantity > availableQty) {
      toast.error(`Insufficient quantity. Only ${availableQty} available.`);
      return;
    }

    // Block if scale exceeded (unless S4/CO override - they should use advanced dialog)
    if (scaleBlocked) {
      toast.error(scaleCheckResult?.warning || "Cannot issue: clothing scale exceeded. Please use the advanced dialog for scale overrides.");
      return;
    }

    setLoading(true);
    try {
      const isBulkLedger = module in QTY_FIELD_CONFIG;

      // Per-unit modules (tools, uniforms, weapons, etc.) track who currently
      // holds the item directly on the row. Bulk stock ledgers (general
      // inventory, works materials) have no such columns - they're just
      // running totals - so skip these for them.
      const updateData: any = isBulkLedger
        ? {}
        : {
            issued_to: selectedSoldier.id,
            issue_date: new Date().toISOString().split('T')[0],
            condition_issue: item.condition_issue || 'Serviceable',
            serviceable: item.serviceable !== false,
          };

      // Only touch these columns when the fetched row actually has them -
      // some per-unit modules (weapons, etc.) carry no quantity fields at all.
      if (qtyConfig.onHandField && item[qtyConfig.onHandField] !== undefined && item[qtyConfig.onHandField] !== null) {
        const currentOnHand = item[qtyConfig.onHandField] || 0;
        updateData[qtyConfig.onHandField] = currentOnHand - quantity;
      }
      if (qtyConfig.issuedField && item[qtyConfig.issuedField] !== undefined) {
        const currentIssued = item[qtyConfig.issuedField] || 0;
        updateData[qtyConfig.issuedField] = currentIssued + quantity;
      }

      // Update item in database
      const { error: updateError } = await supabase
        .from(module)
        .update(updateData)
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: module,
          item_id: item.id,
          transaction_type: 'issue',
          from_user_id: null,
          to_user_id: selectedSoldier.id,
          quantity: quantity,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          condition_issue: item.condition_issue || 'Serviceable',
        }]);

      if (transactionError) throw transactionError;

      // Store issue data for receipt
      setIssuedItemData({
        issueNumber,
        itemName: item.item_name || item.weapon_type || item.tool_name || item.material || 'Unknown',
        quantity,
        soldierName: selectedSoldier.name,
        soldierRank: selectedSoldier.rank || '',
        serviceNumber: selectedSoldier.service_number,
        issuedBy: profile?.name || 'Unknown',
        issuedByRank: profile?.rank || undefined,
        issueDate: new Date().toISOString().split('T')[0],
        condition: item.condition_issue || 'Serviceable',
        unitName: selectedSoldier.unit?.name,
      });

      toast.success(`Item issued to ${selectedSoldier.rank} ${selectedSoldier.name}`);
      setReceiptOpen(true);
      onSuccess();
    } catch (error: any) {
      console.error('Error issuing item:', error);
      const errorMessage = error.message || "Failed to issue item";
      
      // Provide specific error messages
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        toast.error('You do not have permission to issue items.');
      } else if (errorMessage.includes('constraint') || errorMessage.includes('violates')) {
        toast.error('Cannot issue item: Data constraint violation. Please contact support.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('quantity') || errorMessage.includes('insufficient')) {
        toast.error('Insufficient quantity available. Please check inventory.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSoldierSelect = (soldier: any) => {
    setSelectedSoldier(soldier);
    setSoldierSearch("");
    setStep(2); // Move to review step
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Issue Item</DialogTitle>
          <DialogDescription>
            Issue item to a soldier in 3 simple steps
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

        {/* Step 1: Find Soldier */}
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

        {/* Step 2: Review */}
        {step === 2 && selectedSoldier && item && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Item to Issue:</Label>
                <Badge variant="outline">{item.item_id || item.weapon_id || item.tool_id || item.voucher_id || 'N/A'}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium">{item.item_name || item.weapon_type || item.tool_name || item.material}</span>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Issuing To:
                </Label>
                <div className="font-medium">{selectedSoldier.rank} {selectedSoldier.name}</div>
                {selectedSoldier.unit?.name && (
                  <div className="text-sm text-muted-foreground">{selectedSoldier.unit.name}</div>
                )}
              </div>

              {availableQty !== undefined && (
                <div>
                  <Label htmlFor="quantity" className="text-sm">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={availableQty}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {availableQty || 0}
                  </p>
                </div>
              )}

              {/* Scale Check Warning/Block for Clothing Items */}
              {isClothingModule && scaleCheckResult && (
                <div className="mt-3">
                  {scaleBlocked ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Scale Exceeded</AlertTitle>
                      <AlertDescription>
                        {scaleCheckResult.warning || "This soldier already has the maximum authorized quantity. Cannot issue."}
                      </AlertDescription>
                    </Alert>
                  ) : scaleWarning ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Scale Check</AlertTitle>
                      <AlertDescription>
                        {scaleCheckResult.warning}
                      </AlertDescription>
                    </Alert>
                  ) : scaleCheckResult.allowed ? (
                    <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-700 dark:text-green-400">Scale Check Passed</AlertTitle>
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Current: {scaleCheckResult.current}/{scaleCheckResult.max} - Within authorized limit
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  
                  {scaleBlocked && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: S4/CO can use the advanced issue dialog for scale overrides with justification.
                    </p>
                  )}
                </div>
              )}

              {item.condition_issue && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Condition:</Label>
                  <Badge variant={item.condition_issue === 'Serviceable' ? 'default' : 'secondary'}>
                    {item.condition_issue}
                  </Badge>
                </div>
              )}
            </div>

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

        {/* Step 3: Complete */}
        {step === 3 && selectedSoldier && item && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ready to Issue</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Review the details below and click "Issue Item" to complete
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Number:</span>
                <span className="font-medium">{issueNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">{item.item_name || item.weapon_type || item.tool_name || item.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{selectedSoldier.rank} {selectedSoldier.name}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
              )}
            </div>

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
                onClick={handleIssue}
                disabled={loading || scaleBlocked}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Issuing...
                  </>
                ) : scaleBlocked ? (
                  "Cannot Issue (Scale Exceeded)"
                ) : (
                  "✓ Issue Item"
                )}
              </Button>
            </div>
          </div>
        )}

        {!item && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No item selected</p>
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
              // Reset receipt state but don't close main dialog automatically
              setIssuedItemData(null);
            }
          }}
          issueData={issuedItemData}
          onSkip={() => {
            // Just close receipt, keep dialog open for another issue
            setReceiptOpen(false);
            setIssuedItemData(null);
            setStep(1);
            setSelectedSoldier(null);
            setSoldierSearch("");
            setQuantity(1);
          }}
          onIssueAnother={() => {
            // Reset for another issue
            setReceiptOpen(false);
            setIssuedItemData(null);
            setStep(1);
            setSelectedSoldier(null);
            setSoldierSearch("");
            setQuantity(1);
          }}
        />
      )}
    </Dialog>
  );
}

