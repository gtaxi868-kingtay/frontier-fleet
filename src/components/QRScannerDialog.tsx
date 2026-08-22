import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, X } from 'lucide-react';
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';

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
  title = 'Scan QR Code',
  description = 'Scan an item QR code or enter manually',
}: QRScannerDialogProps) {
  const [manualInput, setManualInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    const scannedText = detectedCodes[0]?.rawValue;
    if (scannedText) {
      toast.success('QR Code scanned successfully');
      onScan(scannedText);
      setScannerActive(false);
      onOpenChange(false);
      setManualInput('');
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner error:', error);
    toast.error('Camera error. Please try manual input.');
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter a QR code value');
      return;
    }
    onScan(manualInput.trim());
    onOpenChange(false);
    setManualInput('');
    setScannerActive(false);
  };

  const handleClose = () => {
    setScannerActive(false);
    setManualInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Scanner Section */}
          <div className="space-y-2">
            <Button
              onClick={() => setScannerActive(!scannerActive)}
              variant={scannerActive ? 'destructive' : 'default'}
              className="w-full"
            >
              {scannerActive ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scanner
                </>
              )}
            </Button>

            {scannerActive && (
              <div className="border rounded-lg overflow-hidden bg-black">
                <Scanner
                  constraints={{ facingMode: 'environment' }}
                  onScan={handleScan}
                  onError={handleError}
                />
              </div>
            )}
          </div>

          {/* Manual Input Section */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-qr">QR Code Value</Label>
              <Input
                id="manual-qr"
                placeholder="e.g., weapons|WPN-001|Rifle"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
              />
            </div>

            <Button onClick={handleManualSubmit} variant="outline" className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Submit Manual Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
