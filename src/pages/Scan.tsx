import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { QrCode, RotateCcw } from "lucide-react";
import { decodeQRData, getModuleDisplayName } from "@/lib/qr-utils";
import { useItemLookup, type LookupResult } from "@/hooks/useItemLookup";
import { toast } from "sonner";

const FIELD_LABEL_SKIP = new Set(["id", "created_at", "updated_at", "unit_id", "squadron_id"]);

export default function Scan() {
  const { lookupItem } = useItemLookup();
  const [scannerOpen, setScannerOpen] = useState(true);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleScan = async (qrString: string) => {
    const decoded = decodeQRData(qrString);
    if (!decoded) {
      toast.error("Not a recognized item QR code");
      return;
    }
    const res = await lookupItem(decoded.module, decoded.id);
    setResult(res);
    setScannerOpen(false);
  };

  const scanAnother = () => {
    setResult(null);
    setScannerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scan Item</h1>
            <p className="text-muted-foreground">Point your phone camera at any item's QR label</p>
          </div>
        </div>

        {!result && (
          <Button className="w-full" size="lg" onClick={() => setScannerOpen(true)}>
            <QrCode className="h-5 w-5 mr-2" />
            Open Scanner
          </Button>
        )}

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>{getModuleDisplayName(result.module)}</CardTitle>
                <Badge variant={result.found ? "default" : "destructive"}>
                  {result.found ? "Found" : "Not Found"}
                </Badge>
              </div>
              <CardDescription>Scanned item details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.found && result.item ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {Object.entries(result.item)
                    .filter(([key, value]) => !FIELD_LABEL_SKIP.has(key) && value !== null && value !== "")
                    .map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <p className="text-muted-foreground capitalize text-xs">{key.replace(/_/g, " ")}</p>
                        <p className="font-medium truncate">{String(value)}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No record matches this QR code in {getModuleDisplayName(result.module)}.
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={scanAnother}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Scan Another
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
        title="Scan Item QR Code"
        description="Works for any item type — weapons, tools, uniforms, everything"
      />
    </div>
  );
}
