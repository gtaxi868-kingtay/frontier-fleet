import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, QrCode, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AddToolDialog } from "@/components/AddToolDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { QRCodeLabel } from "@/components/QRCodeLabel";
import { useItemLookup } from "@/hooks/useItemLookup";
import { decodeQRData, type QRCodeData } from "@/lib/qr-utils";
import { toast } from "sonner";
import { useInventoryData } from "@/hooks/useInventoryData";
import { RealtimeInventorySync } from "@/components/RealtimeInventorySync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function Tools() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS';
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelData, setLabelData] = useState<QRCodeData | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; updates: any } | null>(null);

  const handleStatusChange = (tool: any, newServiceable: boolean) => {
    setPendingUpdate({
      id: tool.id,
      updates: { serviceable: newServiceable }
    });
    setConfirmOpen(true);
  };
  
  const { lookupItem } = useItemLookup();
  const { data: tools = [], isLoading, refetch, update } = useInventoryData('tools');

  const handleQRScan = async (qrString: string) => {
    const decoded = decodeQRData(qrString);
    if (!decoded || decoded.module !== 'tools') {
      toast.error('Invalid QR code for tools');
      return;
    }

    const result = await lookupItem('tools', decoded.id);
    if (result.found && result.item) {
      setSelectedTool(result.item);
      setDetailDialogOpen(true);
    }
  };

  const handleGenerateLabel = (tool: any) => {
    const labelData: QRCodeData = {
      module: 'tools',
      id: tool.tool_id,
      name: tool.tool_name,
      additionalInfo: tool.category || undefined,
    };
    setLabelData(labelData);
    setLabelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Tools Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track hand tools, engineer kits, and specialized equipment
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setScannerOpen(true)}
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
            {canManage && (
              <>
                {role === 'S4' && <BulkUploadDialog module="tools" moduleName="Tools" />}
                <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Tool
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tools Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tools..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const filteredTools = tools.filter(tool => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  tool.tool_id?.toLowerCase().includes(searchLower) ||
                  tool.tool_name?.toLowerCase().includes(searchLower) ||
                  tool.category?.toLowerCase().includes(searchLower)
                );
              });
              
              return filteredTools.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchTerm ? "No tools match your search." : "No tools data available. Add tools to get started."}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-accent/50"
                    onClick={() => {
                      setSelectedTool(tool);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {tool.tool_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{tool.tool_name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Category</span>
                        <span className="font-medium">{tool.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                        <span className="font-medium">{tool.qty_on_hand}</span>
                      </div>
                      <div className="pt-2 space-y-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge 
                              variant={tool.serviceable ? 'default' : 'destructive'} 
                              className="w-full justify-center cursor-pointer hover:opacity-80"
                            >
                              {tool.serviceable ? 'Serviceable' : 'Unserviceable'}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="bg-background">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(tool, true);
                              }}
                              disabled={tool.serviceable}
                            >
                              Mark as Serviceable
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(tool, false);
                              }}
                              disabled={!tool.serviceable}
                            >
                              Mark as Unserviceable
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateLabel(tool);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate Label
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <AddToolDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refetch}
        />
        
        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedTool ? `${selectedTool.tool_id} - ${selectedTool.tool_name}` : ''}
          data={selectedTool}
        />

        <QRScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={handleQRScan}
          title="Scan Tool QR Code"
          description="Scan a tool QR code to quickly look up item details"
        />

        {labelData && (
          <QRCodeLabel
            open={labelOpen}
            onOpenChange={setLabelOpen}
            data={labelData}
          />
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => {
            if (pendingUpdate) {
              update(pendingUpdate);
              setPendingUpdate(null);
            }
            setConfirmOpen(false);
          }}
          title="Confirm Update"
          description="Are you sure you want to update this tool? This action will be logged in the audit trail with your user details and timestamp."
        />

        <RealtimeInventorySync module="tools" onDataChange={refetch} />
      </main>
    </div>
  );
}
