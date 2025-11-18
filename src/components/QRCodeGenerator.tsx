import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  itemType: string;
}

export function QRCodeGenerator({
  open,
  onOpenChange,
  data,
  itemType,
}: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code data string based on item type
  const generateQRData = () => {
    switch (itemType) {
      case "weapons":
        return `${data.weapon_id}|${data.weapon_type}|${data.serial_number || ""}|${data.rack_number || ""}`;
      case "vehicles":
        return `${data.vehicle_id}|${data.vehicle_type}|${data.registration_number || ""}|${data.serial_number || ""}`;
      case "tools":
        return `${data.tool_id}|${data.tool_name}|${data.category}`;
      case "uniforms":
        return `${data.uniform_id}|${data.item_name}|${data.size || ""}`;
      case "ppe":
        return `${data.ppe_id}|${data.item}|${data.category}`;
      case "engineer_equipment":
        return `${data.equip_id}|${data.equipment_name}|${data.type}`;
      case "plant_machinery":
        return `${data.plant_id}|${data.type}|${data.serial_number || ""}`;
      case "mechanics_tools":
        return `${data.tool_id}|${data.tool_name}|${data.category}`;
      case "explosives":
        return `${data.explosive_id}|${data.type}|${data.lot_number}`;
      case "general_inventory":
        return `${data.item_id}|${data.item_name}|${data.category}`;
      default:
        return data.id;
    }
  };

  const qrData = generateQRData();

  const getItemTitle = () => {
    switch (itemType) {
      case "weapons":
        return `${data.weapon_type} - ${data.weapon_id}`;
      case "vehicles":
        return `${data.vehicle_type} - ${data.vehicle_id}`;
      case "tools":
        return `${data.tool_name}`;
      case "uniforms":
        return `${data.item_name} - ${data.uniform_id}`;
      case "ppe":
        return `${data.item} - ${data.ppe_id}`;
      case "engineer_equipment":
        return `${data.equipment_name}`;
      case "plant_machinery":
        return `${data.type} - ${data.plant_id}`;
      case "mechanics_tools":
        return `${data.tool_name}`;
      case "explosives":
        return `${data.type} - ${data.explosive_id}`;
      case "general_inventory":
        return `${data.item_name}`;
      default:
        return "Inventory Item";
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("qr-label");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${itemType}-${data.id}-qr-label.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("QR label downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR label");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>QR Code Label</DialogTitle>
          <DialogDescription>
            Download or print this QR code label for the inventory item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            id="qr-label"
            className="bg-background border-2 border-border rounded-lg p-6 flex flex-col items-center gap-4"
          >
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">{getItemTitle()}</h3>
              <p className="text-sm text-muted-foreground">{itemType.replace('_', ' ').toUpperCase()}</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {qrData}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Download"}
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #qr-label, #qr-label * {
              visibility: visible;
            }
            #qr-label {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
