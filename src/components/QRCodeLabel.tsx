import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { encodeQRData, type QRCodeData, getModuleDisplayName } from '@/lib/qr-utils';

interface QRCodeLabelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: QRCodeData;
}

export function QRCodeLabel({ open, onOpenChange, data }: QRCodeLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const qrValue = encodeQRData(data);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!labelRef.current) return;

    try {
      const canvas = await html2canvas(labelRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${data.module}-${data.id}-label.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Label downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download label');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Item QR Code Label</DialogTitle>
          <DialogDescription>
            Print or download this label to attach to the item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Label Preview */}
          <div
            ref={labelRef}
            className="border-2 border-dashed rounded-lg p-6 bg-white text-black print:border-solid"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code */}
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="H"
                includeMargin={true}
              />

              {/* Item Info */}
              <div className="text-center space-y-1 w-full">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {getModuleDisplayName(data.module)}
                </p>
                <p className="text-lg font-bold break-all">{data.id}</p>
                <p className="text-sm break-all">{data.name}</p>
                {data.additionalInfo && (
                  <p className="text-xs text-gray-500 break-all">{data.additionalInfo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Label
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
