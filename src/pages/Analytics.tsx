import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Readiness forecasting and predictive analytics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Battalion Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Analytics data will appear here once backend is connected.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Usage trends will appear here once backend is connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
