import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrReader } from "react-qr-reader";
import { Camera, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (data: string) => void;
  title?: string;
  description?: string;
}

export function QRScannerDialog({
  open,
  onOpenChange,
  onScan,
  title = "Scan QR Code",
  description = "Use your camera to scan a QR code or paste the code data",
}: QRScannerDialogProps) {
  const [manualInput, setManualInput] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result?.text) {
      onScan(result.text);
      toast.success("QR Code scanned successfully");
      onOpenChange(false);
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scanner error:", error);
    setCameraError("Camera access denied or not available. Please use manual input.");
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      toast.success("Data processed successfully");
      setManualInput("");
      onOpenChange(false);
    } else {
      toast.error("Please enter QR code data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <Camera className="w-4 h-4 mr-2" />
              Camera Scan
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Upload className="w-4 h-4 mr-2" />
              Manual Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            {cameraError ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {cameraError}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: "environment" }}
                  containerStyle={{ width: "100%" }}
                  videoContainerStyle={{ paddingTop: "100%" }}
                  videoStyle={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  scanDelay={300}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Position the QR code within the camera frame
            </p>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Textarea
              placeholder="Paste QR code data here (e.g., WEAPON001|Rifle|SN12345|Rack-A1)"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows={4}
            />
            <Button onClick={handleManualSubmit} className="w-full">
              Process Data
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
