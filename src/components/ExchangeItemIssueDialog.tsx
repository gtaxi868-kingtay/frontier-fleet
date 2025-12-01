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
import { Search, User, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClothingScale, useClothingScaleCheck } from "@/hooks/useClothingScale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface ExchangeItemIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newIssueIds: string[]) => void;
  exchange: {
    id: string;
    item_name: string;
    items_handed_in: string[];
    unit_id: string;
  };
  itemsHandedIn: any[]; // Array of clothing_equipment_issues that were handed in
}

export function ExchangeItemIssueDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  exchange,
  itemsHandedIn 
}: ExchangeItemIssueDialogProps) {
  const { profile } = useAuth();
  const { checkScaleAvailability } = useClothingScale();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [issueResults, setIssueResults] = useState<Array<{ soldierId: string; issueId: string }>>([]);
  const [currentSoldier, setCurrentSoldier] = useState<any>(null);
  const [soldierSearch, setSoldierSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [conditionOnIssue, setConditionOnIssue] = useState("Serviceable");
  const [regimentalNumberMarked, setRegimentalNumberMarked] = useState(false);

  // Fetch soldiers for search
  const { data: soldiers = [] } = useQuery({
    queryKey: ['soldiers-for-exchange-issue'],
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

  // Group items handed in by soldier
  const itemsBySoldier = itemsHandedIn.reduce((acc, item) => {
    const soldierId = item.soldier_id || item.soldier?.id;
    if (!soldierId) return acc;
    if (!acc[soldierId]) {
      acc[soldierId] = {
        soldier: item.soldier || { id: soldierId },
        items: [],
      };
    }
    acc[soldierId].items.push(item);
    return acc;
  }, {} as Record<string, { soldier: any; items: any[] }>);

  const soldiersToIssueTo = Object.values(itemsBySoldier);

  // Check scale for current soldier
  const { data: scaleCheckResult } = useClothingScaleCheck(
    currentSoldier?.id || null,
    currentSoldier?.rank || null,
    exchange.item_name,
    quantity,
    step === 2 && !!currentSoldier
  );

  const handleSoldierSelect = (soldier: any) => {
    setCurrentSoldier(soldier);
    setSoldierSearch("");
    setQuantity(1);
    setStep(2);
  };

  const handleIssueItem = async () => {
    if (!currentSoldier) {
      toast.error("Please select a soldier");
      return;
    }

    // Check scale if needed
    if (scaleCheckResult && !scaleCheckResult.allowed) {
      toast.error(scaleCheckResult.warning || "Cannot issue: scale exceeded");
      return;
    }

    setLoading(true);
    try {
      // Generate issue number
      const timestamp = Date.now().toString().slice(-6);
      const issueNumber = `CE-EX-${timestamp}`;

      // Create new issue record
      const { data: issueData, error: issueError } = await supabase
        .from('clothing_equipment_issues')
        .insert([{
          issue_number: issueNumber,
          soldier_id: currentSoldier.id,
          item_name: exchange.item_name,
          item_category: 'clothing', // Default, could be determined from exchange
          quantity_issued: quantity,
          issue_date: new Date().toISOString().split('T')[0],
          issued_by_id: profile?.id,
          condition_on_issue: conditionOnIssue,
          regimental_number_marked: regimentalNumberMarked,
          notes: `Issued as replacement in exchange ${exchange.id}`,
        }])
        .select()
        .single();

      if (issueError) throw issueError;

      // Add to results
      setIssueResults([...issueResults, {
        soldierId: currentSoldier.id,
        issueId: issueData.id,
      }]);

      // Create transaction record
      await supabase
        .from('transactions_detailed')
        .insert([{
          item_table: 'clothing_equipment_issues',
          item_id: issueData.id,
          transaction_type: 'issue',
          from_user_id: null,
          to_user_id: currentSoldier.id,
          quantity: quantity,
          issued_by_id: profile?.id,
          unit_id: profile?.unit_id,
          condition_issue: conditionOnIssue,
          notes: `Exchange replacement for ${exchange.id}`,
        }]);

      toast.success(`Item issued to ${currentSoldier.rank} ${currentSoldier.name}`);
      
      // Reset for next item
      setCurrentSoldier(null);
      setSoldierSearch("");
      setQuantity(1);
      setStep(1);
    } catch (error: any) {
      console.error("Error issuing item:", error);
      toast.error(error.message || "Failed to issue item");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const newIssueIds = issueResults.map(r => r.issueId);
    onSuccess(newIssueIds);
    onOpenChange(false);
    // Reset state
    setStep(1);
    setIssueResults([]);
    setCurrentSoldier(null);
    setSoldierSearch("");
    setQuantity(1);
  };

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setIssueResults([]);
      setCurrentSoldier(null);
      setSoldierSearch("");
      setQuantity(1);
      setConditionOnIssue("Serviceable");
      setRegimentalNumberMarked(false);
    }
  }, [open]);

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Replacement Items</DialogTitle>
          <DialogDescription>
            Issue replacement items for exchange: {exchange.item_name}
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

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="text-sm">
            <span className="font-medium">Items to issue:</span> {soldiersToIssueTo.length}
          </div>
          <div className="text-sm">
            <span className="font-medium">Issued so far:</span> {issueResults.length}
          </div>
        </div>

        {/* Step 1: Select Soldier (from those who handed in items) */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Issue Replacement to Soldier</AlertTitle>
              <AlertDescription>
                Select a soldier who handed in items for exchange to issue their replacement.
              </AlertDescription>
            </Alert>

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
                  {filteredSoldiers
                    .filter(s => soldiersToIssueTo.some(st => st.soldier.id === s.id))
                    .slice(0, 5)
                    .map((soldier: any) => {
                      const alreadyIssued = issueResults.some(r => r.soldierId === soldier.id);
                      return (
                        <button
                          key={soldier.id}
                          type="button"
                          className={`w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0 ${
                            alreadyIssued ? 'opacity-50' : ''
                          }`}
                          onClick={() => handleSoldierSelect(soldier)}
                          disabled={alreadyIssued}
                        >
                          <div className="font-medium">
                            {soldier.rank} {soldier.name}
                            {alreadyIssued && <Badge variant="outline" className="ml-2">Already Issued</Badge>}
                          </div>
                          {soldier.unit?.name && (
                            <div className="text-sm text-muted-foreground">{soldier.unit.name}</div>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {issueResults.length > 0 && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2">Issued Items:</Label>
                <div className="space-y-2">
                  {issueResults.map((result, idx) => {
                    const soldierInfo = soldiersToIssueTo.find(st => st.soldier.id === result.soldierId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <span className="text-sm">
                          {soldierInfo?.soldier.rank} {soldierInfo?.soldier.name}
                        </span>
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Issued
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {issueResults.length === soldiersToIssueTo.length && (
              <Button onClick={handleComplete} className="w-full">
                Complete Exchange
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Issue Details */}
        {step === 2 && currentSoldier && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="font-medium">Soldier: {currentSoldier.rank} {currentSoldier.name}</div>
              <div className="text-sm text-muted-foreground">Item: {exchange.item_name}</div>
            </div>

            {scaleCheckResult && scaleCheckResult.warning && (
              <Alert variant={scaleCheckResult.allowed ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {scaleCheckResult.allowed ? "Scale Check" : "Scale Exceeded"}
                </AlertTitle>
                <AlertDescription>{scaleCheckResult.warning}</AlertDescription>
              </Alert>
            )}

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
              <input
                type="checkbox"
                id="regimental-marked"
                checked={regimentalNumberMarked}
                onChange={(e) => setRegimentalNumberMarked(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="regimental-marked">Regimental Number Marked</Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setCurrentSoldier(null);
                }}
                disabled={loading}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleIssueItem}
                disabled={loading || (scaleCheckResult && !scaleCheckResult.allowed)}
                className="flex-1"
              >
                {loading ? "Issuing..." : "Issue Item"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

