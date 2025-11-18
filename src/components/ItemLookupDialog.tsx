import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRScannerDialog } from "./QRScannerDialog";

interface ItemLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemLookupDialog({ open, onOpenChange }: ItemLookupDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const tables = [
    { name: "weapons", idField: "weapon_id", nameField: "weapon_type" },
    { name: "vehicles", idField: "vehicle_id", nameField: "vehicle_type" },
    { name: "tools", idField: "tool_id", nameField: "tool_name" },
    { name: "uniforms", idField: "uniform_id", nameField: "item_name" },
    { name: "ppe", idField: "ppe_id", nameField: "item" },
    { name: "engineer_equipment", idField: "equip_id", nameField: "equipment_name" },
    { name: "plant_machinery", idField: "plant_id", nameField: "type" },
    { name: "mechanics_tools", idField: "tool_id", nameField: "tool_name" },
    { name: "explosives", idField: "explosive_id", nameField: "type" },
    { name: "general_inventory", idField: "item_id", nameField: "item_name" },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    const allResults: any[] = [];

    try {
      // Search across all inventory tables
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name)
          .select("*")
          .or(`${table.idField}.ilike.%${query}%,${table.nameField}.ilike.%${query}%`)
          .limit(5);

        if (data && !error) {
          allResults.push(
            ...data.map((item) => ({
              ...item,
              _table: table.name,
              _idField: table.idField,
              _nameField: table.nameField,
            }))
          );
        }
      }

      setResults(allResults);
      if (allResults.length === 0) {
        toast.info("No items found matching your search");
      } else {
        toast.success(`Found ${allResults.length} items`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQRScan = (data: string) => {
    // Extract the first field (ID) from scanned data
    const id = data.split("|")[0];
    setSearchQuery(id);
    handleSearch(id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Item Lookup</DialogTitle>
            <DialogDescription>
              Search for inventory items across all categories
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              placeholder="Search by ID, name, serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
            />
            <Button onClick={() => handleSearch(searchQuery)} disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
            <Button onClick={() => setScannerOpen(true)} variant="outline">
              <Scan className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {results.length === 0 && !isSearching && (
              <div className="text-center py-8 text-muted-foreground">
                Enter a search term or scan a QR code to find items
              </div>
            )}

            {results.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {item[item._nameField]} - {item[item._idField]}
                    </CardTitle>
                    <Badge variant="outline">
                      {item._table.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {item.serial_number && (
                      <div>
                        <span className="text-muted-foreground">Serial:</span>{" "}
                        {item.serial_number}
                      </div>
                    )}
                    {item.serviceable !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge variant={item.serviceable ? "default" : "destructive"}>
                          {item.serviceable ? "Serviceable" : "Unserviceable"}
                        </Badge>
                      </div>
                    )}
                    {item.serviceability && (
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge
                          variant={
                            item.serviceability === "Serviceable"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {item.serviceability}
                        </Badge>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        {item.location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
        title="Scan Item QR Code"
        description="Scan the QR code on an inventory item to look it up"
      />
    </>
  );
}
