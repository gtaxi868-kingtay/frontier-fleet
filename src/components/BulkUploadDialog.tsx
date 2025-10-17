import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BulkUploadDialogProps {
  module: 'weapons' | 'tools' | 'engineer_equipment' | 'plant_machinery' | 'vehicles' | 'mechanics_tools' | 
          'mt_facilities' | 'ppe' | 'uniforms' | 'explosives' | 'facilities' | 'works_materials' | 
          'general_inventory' | 'room_inventory';
  moduleName: string;
}

export function BulkUploadDialog({ module, moduleName }: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        try {
          const { error } = await supabase.from(module).insert([row as any]);
          if (error) {
            failedCount++;
            errors.push(`Row failed: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          failedCount++;
          errors.push(`Row failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      setUploadResult({ success: successCount, failed: failedCount, errors });

      if (successCount > 0) {
        toast({
          title: "Bulk Upload Complete",
          description: `Successfully uploaded ${successCount} records${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a sample template based on the module
    const templates: Record<string, any[]> = {
      weapons: [{ weapon_id: 'W001', weapon_type: 'Rifle', serial_number: 'SN12345', serviceable: true, rack_number: 'R1' }],
      tools: [{ tool_id: 'T001', tool_name: 'Hammer', category: 'Hand Tools', qty_on_hand: 10, serviceable: true }],
      vehicles: [{ vehicle_id: 'V001', vehicle_type: 'Truck', make_model: 'Toyota Hilux', registration_number: 'ABC123', serviceability: 'Serviceable' }],
      // Add more templates as needed
    };

    const template = templates[module] || [{ id: 'Sample data - modify columns as needed' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${module}_template.xlsx`);

    toast({
      title: "Template Downloaded",
      description: `Excel template for ${moduleName} has been downloaded.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload - {moduleName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Excel/Google Sheets Upload</p>
                <p className="text-xs text-muted-foreground">Upload .xlsx, .xls, or .csv files</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
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
                <p className="text-sm text-blue-700 dark:text-blue-300">Processing upload...</p>
              </div>
            )}

            {uploadResult && (
              <div className="space-y-2">
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
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        {uploadResult.failed} records failed
                      </p>
                      {uploadResult.errors.length > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResult.errors.slice(0, 5).map((error, index) => (
                            <p key={index}>• {error}</p>
                          ))}
                          {uploadResult.errors.length > 5 && (
                            <p>... and {uploadResult.errors.length - 5} more errors</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <h4 className="text-sm font-medium">Instructions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Download the template to see required columns</li>
                <li>Fill in your data following the template structure</li>
                <li>Ensure all required fields are filled</li>
                <li>Upload the completed file</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}