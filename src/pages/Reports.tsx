import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function Reports() {
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
          {[
            "Arms State Report",
            "Equipment Holding Report",
            "Inspection Report",
            "Loss/Damage Report",
            "Ammunition Expenditure",
            "Accommodation Inventory Report",
          ].map((report) => (
            <Card key={report} className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {report}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Download className="h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
