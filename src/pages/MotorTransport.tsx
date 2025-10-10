import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Wrench, Car, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MotorTransport() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Motor Transport (MT) Department
            </h1>
            <p className="text-muted-foreground mt-1">
              Vehicles, mechanics' tools, and maintenance facilities management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-primary" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviceable:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unserviceable:</span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Vehicles:</span>
                  <Badge variant="outline">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-accent" />
                Mechanics Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools On Hand:</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools Issued:</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviceable:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-secondary" />
                Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workshops:</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Working:</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maintenance Due:</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="tools">Mechanics Tools</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Fleet Inventory</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search vehicles..." className="pl-9" />
                    </div>
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No vehicles registered. Add vehicles to track fleet inventory and fuel consumption.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mechanics Tools Inventory</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search tools..." className="pl-9" />
                    </div>
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Tool
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No tools registered. Add mechanics tools to track specialized equipment.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities">
            <Card className="border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MT Facilities</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search facilities..." className="pl-9" />
                    </div>
                    <Button variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Facility
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No facilities registered. Add workshops and maintenance areas to track MT spaces.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
