import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface BulkUploadDialogProps {
  module: 'weapons' | 'tools' | 'engineer_equipment' | 'plant_machinery' | 'vehicles' | 'mechanics_tools' | 
          'mt_facilities' | 'ppe' | 'uniforms' | 'explosives' | 'facilities' | 'works_materials' | 
          'general_inventory' | 'room_inventory';
  moduleName: string;
  onSuccess?: () => void;
}

interface ParsedRow {
  data: any;
  errors: string[];
  isValid: boolean;
  rowNumber: number;
}

export function BulkUploadDialog({ module, moduleName, onSuccess }: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const { toast } = useToast();

  const requiredFields: Record<string, string[]> = {
    weapons: ['weapon_id', 'weapon_type', 'serial_number'],
    tools: ['tool_id', 'tool_name', 'category'],
    vehicles: ['vehicle_id', 'vehicle_type'],
    engineer_equipment: ['equip_id', 'equipment_name', 'type'],
    plant_machinery: ['plant_id', 'type'],
    mechanics_tools: ['tool_id', 'tool_name', 'category'],
    mt_facilities: ['facility_id', 'facility_name', 'facility_type'],
    ppe: ['ppe_id', 'item', 'category'],
    uniforms: ['uniform_id', 'item_name'],
    explosives: ['explosive_id', 'type', 'lot_number', 'storage_location', 'authority'],
    facilities: ['facility_id', 'facility_name'],
    works_materials: ['voucher_id', 'material', 'project_task'],
    general_inventory: ['item_id', 'item_name', 'category'],
    room_inventory: ['room_id', 'inventory_item'],
  };

  const validateRow = (row: any, rowNumber: number): ParsedRow => {
    const errors: string[] = [];
    const required = requiredFields[module] || [];

    required.forEach(field => {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (row.qty_on_hand !== undefined && (isNaN(Number(row.qty_on_hand)) || Number(row.qty_on_hand) < 0)) {
      errors.push('qty_on_hand must be a positive number');
    }
    if (row.qty_issued !== undefined && (isNaN(Number(row.qty_issued)) || Number(row.qty_issued) < 0)) {
      errors.push('qty_issued must be a positive number');
    }
    if (row.serviceable !== undefined && typeof row.serviceable === 'string') {
      const val = row.serviceable.toLowerCase();
      if (val !== 'true' && val !== 'false' && val !== 'yes' && val !== 'no') {
        errors.push('serviceable must be true/false or yes/no');
      }
      row.serviceable = val === 'true' || val === 'yes';
    }

    return {
      data: row,
      errors,
      isValid: errors.length === 0,
      rowNumber
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setParsedData([]);
    setUploadResult(null);
    setShowPreview(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Empty File",
          description: "The uploaded file contains no data.",
          variant: "destructive",
        });
        return;
      }

      if (jsonData.length > 1000) {
        toast({
          title: "File Too Large",
          description: "Please upload files with 1000 rows or fewer.",
          variant: "destructive",
        });
        return;
      }

      const parsed = jsonData.map((row, index) => validateRow(row, index + 2));
      setParsedData(parsed);
      setShowPreview(true);

      const validCount = parsed.filter(r => r.isValid).length;
      const invalidCount = parsed.length - validCount;

      toast({
        title: "File Parsed",
        description: `Found ${parsed.length} rows: ${validCount} valid, ${invalidCount} with errors`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to read file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (parsedData.length === 0) return;

    setLoading(true);
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    const validRows = parsedData.filter(r => r.isValid);

    for (const row of validRows) {
      try {
        const { error } = await supabase.from(module).insert([row.data]);
        if (error) {
          failedCount++;
          errors.push(`Row ${row.rowNumber}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        failedCount++;
        errors.push(`Row ${row.rowNumber}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    setUploadResult({ success: successCount, failed: failedCount, errors });
    setShowPreview(false);
    setLoading(false);

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} records${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
      });
      onSuccess?.();
    }
  };

  const downloadTemplate = () => {
    const templates: Record<string, any[]> = {
      weapons: [{ 
        weapon_id: 'W001',
        weapon_type: 'GALIL AR', 
        serial_number: '38161438',
        serviceable: 'yes',
        service_number: '10485',
        rank: 'Sgt',
        name: 'Betrand A',
        rack_number: '10',
        mag_amount: 7,
        page_64_no: 'A PG 4',
        store_location: 'Alpha Coy',
        condition_issue: 'SERVICEABLE'
      }],
      tools: [{ tool_id: 'T001', tool_name: 'Hammer', category: 'Hand Tools', qty_on_hand: 10, serviceable: 'yes' }],
      vehicles: [{ vehicle_id: 'V001', vehicle_type: 'Truck', make_model: 'Toyota Hilux', registration_number: 'ABC123', serviceability: 'Serviceable', fuel_type: 'Diesel', mileage: 50000 }],
      engineer_equipment: [{ equip_id: 'EE001', equipment_name: 'Excavator', type: 'Heavy Equipment', qty_on_hand: 2, serviceable: 'yes' }],
      plant_machinery: [{ plant_id: 'PM001', type: 'Generator', make_model: 'CAT 100kW', serial_number: 'SN789', serviceability: 'Serviceable', fuel_type: 'Diesel' }],
      mechanics_tools: [{ tool_id: 'MT001', tool_name: 'Impact Wrench', category: 'Power Tools', qty_on_hand: 5, serviceable: 'yes' }],
      mt_facilities: [{ facility_id: 'MTF001', facility_name: 'Workshop A', facility_type: 'Repair', status: 'Operational', capacity: 10 }],
      ppe: [{ ppe_id: 'PPE001', item: 'Safety Helmet', category: 'Head Protection', qty_on_hand: 50, serviceable: 'yes' }],
      uniforms: [{ uniform_id: 'U001', item_name: 'Combat Uniform', size: 'Medium', serviceable: 'yes' }],
      explosives: [{ explosive_id: 'EXP001', type: 'Training Explosive', lot_number: 'LOT123', quantity_received: 100, storage_location: 'Bunker 1', authority: 'Order #123' }],
      facilities: [{ facility_id: 'FAC001', facility_name: 'Barracks A', element: 'Accommodation', working: 10, not_working: 0, quantity: 10 }],
      works_materials: [{ voucher_id: 'VM001', material: 'Cement', project_task: 'Road Repair', quantity_received: 100, quantity_issued: 20, authority: 'Order #456' }],
      general_inventory: [{ item_id: 'GI001', item_name: 'A4 Paper', category: 'Stationery', qty_on_hand: 500, reorder_level: 100 }],
      room_inventory: [{ room_id: 'R001', room_type: 'Barracks', inventory_item: 'Bed', expected_qty: 20, present_qty: 20, platoon_company: 'A Company' }],
    };

    const template = templates[module] || [{ id: 'Sample data' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${module}_template.xlsx`);

    toast({
      title: "Template Downloaded",
      description: `Excel template for ${moduleName} has been downloaded.`,
    });
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setParsedData([]);
        setShowPreview(false);
        setUploadResult(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Upload - {moduleName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!showPreview && !uploadResult && (
            <>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Excel/CSV Upload</p>
                  <p className="text-xs text-muted-foreground">Upload .xlsx, .xls, or .csv files (max 1000 rows)</p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {loading && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Processing file...</p>
                </div>
              )}
            </>
          )}

          {showPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Preview & Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    {validCount} valid, {invalidCount} with errors
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                  setShowPreview(false);
                  setParsedData([]);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-4 space-y-2">
                  {parsedData.map((row) => (
                    <div
                      key={row.rowNumber}
                      className={`p-3 rounded-lg border ${
                        row.isValid 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={row.isValid ? "default" : "destructive"}>
                            Row {row.rowNumber}
                          </Badge>
                          {row.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        {Object.entries(row.data).slice(0, 5).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>

                      {!row.isValid && (
                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900">
                          {row.errors.map((error, idx) => (
                            <p key={idx} className="text-xs text-red-700 dark:text-red-300">• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowPreview(false);
                  setParsedData([]);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmUpload}
                  disabled={loading || validCount === 0}
                >
                  {loading ? 'Uploading...' : `Upload ${validCount} Valid Row${validCount !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}

          {uploadResult && (
            <div className="space-y-4">
              {uploadResult.success > 0 && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {uploadResult.success} records uploaded successfully
                    </p>
                  </div>
                </div>
              )}

              {uploadResult.failed > 0 && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {uploadResult.failed} records failed
                    </p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {uploadResult.errors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-600 dark:text-red-400">• {error}</p>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              <Button onClick={() => {
                setOpen(false);
                setUploadResult(null);
              }} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
