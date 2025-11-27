import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type ReportType = {
  name: string;
  description: string;
  query: () => Promise<any[]>;
  filename: string;
};

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);

  const reports: ReportType[] = [
    {
      name: "Arms State Report",
      description: "Complete weapons inventory with serviceability status",
      filename: "arms-state-report",
      query: async () => {
        const { data } = await supabase.from("weapons").select("*").order("weapon_id");
        return data || [];
      }
    },
    {
      name: "Equipment Holding Report",
      description: "Consolidated equipment across all modules",
      filename: "equipment-holding-report",
      query: async () => {
        const [vehicles, tools, engineer, plant] = await Promise.all([
          supabase.from("vehicles").select("*"),
          supabase.from("tools").select("*"),
          supabase.from("engineer_equipment").select("*"),
          supabase.from("plant_machinery").select("*")
        ]);
        return [
          ...(vehicles.data || []).map(v => ({ ...v, module: 'Vehicles' })),
          ...(tools.data || []).map(t => ({ ...t, module: 'Tools' })),
          ...(engineer.data || []).map(e => ({ ...e, module: 'Engineer Equipment' })),
          ...(plant.data || []).map(p => ({ ...p, module: 'Plant Machinery' }))
        ];
      }
    },
    {
      name: "Inspection Report",
      description: "Items due for inspection or recently inspected",
      filename: "inspection-report",
      query: async () => {
        const [weapons, tools, engineer] = await Promise.all([
          supabase.from("weapons").select("*").not("next_inspection_due", "is", null),
          supabase.from("tools").select("*").not("next_inspection_due", "is", null),
          supabase.from("engineer_equipment").select("*").not("next_inspection_due", "is", null)
        ]);
        return [
          ...(weapons.data || []).map(w => ({ ...w, module: 'Weapons' })),
          ...(tools.data || []).map(t => ({ ...t, module: 'Tools' })),
          ...(engineer.data || []).map(e => ({ ...e, module: 'Engineer Equipment' }))
        ];
      }
    },
    {
      name: "Loss/Damage Report",
      description: "Items requiring survey reports or marked unserviceable",
      filename: "loss-damage-report",
      query: async () => {
        const { data } = await supabase
          .from("weapons")
          .select("*")
          .or("survey_report_filed.eq.true,serviceable.eq.false");
        return data || [];
      }
    },
    {
      name: "Ammunition Expenditure",
      description: "Explosives and ammunition tracking report",
      filename: "ammunition-expenditure",
      query: async () => {
        const { data } = await supabase.from("explosives").select("*").order("issue_date", { ascending: false });
        return data || [];
      }
    },
    {
      name: "Accommodation Inventory Report",
      description: "Room inventory and accommodation status",
      filename: "accommodation-inventory",
      query: async () => {
        const { data } = await supabase.from("room_inventory").select("*").order("room_id");
        return data || [];
      }
    }
  ];

  const generateReport = async (report: ReportType) => {
    setGenerating(report.name);
    try {
      const data = await report.query();
      
      if (data.length === 0) {
        toast.warning("No data available for this report");
        return;
      }

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, report.name);

      // Generate file
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${report.filename}-${timestamp}.xlsx`);

      // Log report generation
      await supabase.from("reports").insert({
        type: report.name,
        summary: `Generated ${report.name} with ${data.length} records`,
      });

      toast.success(`${report.name} generated successfully`);
    } catch (error: any) {
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Reports & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and download official military reports
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.name} className="border-border/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {report.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => generateReport(report)}
                  disabled={generating === report.name}
                >
                  {generating === report.name ? (
                    <>
                      <Calendar className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• All reports are generated in Excel format for easy analysis and archival</p>
            <p>• Reports are automatically logged in the audit trail</p>
            <p>• Generated files include timestamp for version tracking</p>
            <p>• Report data reflects current database state at time of generation</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
