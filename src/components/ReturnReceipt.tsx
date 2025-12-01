import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReturnReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnData: {
    issueNumber?: string;
    itemName: string;
    quantity: number;
    soldierName: string;
    soldierRank: string;
    serviceNumber?: string;
    returnedBy: string;
    returnedByRank?: string;
    returnDate: string;
    conditionOnReturn: string;
    unitName?: string;
  };
  onSkip?: () => void;
  onReturnAnother?: () => void;
}

export function ReturnReceipt({ open, onOpenChange, returnData, onSkip, onReturnAnother }: ReturnReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const qrValue = JSON.stringify({
    type: 'return_receipt',
    issueNumber: returnData.issueNumber,
    date: returnData.returnDate,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `return-receipt-${returnData.issueNumber || 'unknown'}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle>Return Receipt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              ref={receiptRef}
              className="receipt-content bg-white text-black p-8 border border-gray-300"
            >
              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold uppercase mb-2">Trinidad and Tobago Regiment</h1>
                <h2 className="text-xl font-semibold">Return Receipt</h2>
                {returnData.unitName && (
                  <p className="text-sm mt-1">{returnData.unitName}</p>
                )}
              </div>

              {/* Receipt Details */}
              <div className="space-y-4 mb-6">
                {returnData.issueNumber && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Original Issue Number:</p>
                      <p className="text-base">{returnData.issueNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Return Date:</p>
                      <p className="text-base">{format(new Date(returnData.returnDate), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Returned By:</p>
                  <div className="pl-4">
                    <p className="text-base">{returnData.soldierRank} {returnData.soldierName}</p>
                    {returnData.serviceNumber && (
                      <p className="text-sm text-gray-600">Service Number: {returnData.serviceNumber}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Item Details:</p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="text-left p-2 font-semibold">Item Name</th>
                        <th className="text-center p-2 font-semibold">Quantity</th>
                        <th className="text-left p-2 font-semibold">Condition on Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="p-2">{returnData.itemName}</td>
                        <td className="p-2 text-center">{returnData.quantity}</td>
                        <td className="p-2">{returnData.conditionOnReturn}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Received By:</p>
                  <div className="pl-4">
                    <p className="text-base">{returnData.returnedByRank || ''} {returnData.returnedBy}</p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-8 border-t-2 border-black pt-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Returning Signature:</p>
                  <div className="border-b border-black h-16"></div>
                  <p className="text-xs mt-1">{returnData.soldierRank} {returnData.soldierName}</p>
                  <p className="text-xs text-gray-600">Date: _______________</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Receiving Officer Signature:</p>
                  <div className="border-b border-black h-16"></div>
                  <p className="text-xs mt-1">{returnData.returnedByRank || ''} {returnData.returnedBy}</p>
                  <p className="text-xs text-gray-600">Date: _______________</p>
                </div>
              </div>

              {/* QR Code for verification */}
              <div className="mt-6 flex justify-center">
                <div className="text-center">
                  <QRCodeSVG value={qrValue} size={80} level="H" includeMargin={true} />
                  <p className="text-xs mt-1 text-gray-500">Digital Verification</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 border-t pt-4 text-xs text-gray-600">
                <p className="text-center">
                  This receipt acknowledges the return of the above items. Items must be inspected and any deficiencies noted.
                </p>
                <p className="text-center mt-2">
                  Return Date: {format(new Date(returnData.returnDate), 'dd MMM yyyy')} | Generated: {format(new Date(), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 no-print flex-wrap">
              <Button onClick={handlePrint} className="flex-1 min-w-[120px]">
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 min-w-[120px]">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {onSkip && (
                <Button
                  onClick={() => {
                    onSkip();
                    onOpenChange(false);
                  }}
                  variant="ghost"
                  className="min-w-[120px]"
                >
                  Skip Receipt
                </Button>
              )}
              {onReturnAnother && (
                <Button
                  onClick={() => {
                    onReturnAnother();
                    onOpenChange(false);
                  }}
                  variant="default"
                  className="min-w-[140px]"
                >
                  Return Another Item
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

