import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shirt, Footprints, Scissors, Bed, Wrench } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaundryBookDialog } from "@/components/LaundryBookDialog";
import { BootBookDialog } from "@/components/BootBookDialog";
import { TailorBookDialog } from "@/components/TailorBookDialog";
import { BeddingBookDialog } from "@/components/BeddingBookDialog";
import { RepairBookDialog } from "@/components/RepairBookDialog";
import { LaundryBookList } from "@/components/LaundryBookList";
import { BootBookList } from "@/components/BootBookList";
import { TailorBookList } from "@/components/TailorBookList";
import { BeddingBookList } from "@/components/BeddingBookList";
import { RepairBookList } from "@/components/RepairBookList";

export default function CompanyStores() {
  const { role } = useAuth();
  const [laundryDialogOpen, setLaundryDialogOpen] = useState(false);
  const [bootDialogOpen, setBootDialogOpen] = useState(false);
  const [tailorDialogOpen, setTailorDialogOpen] = useState(false);
  const [beddingDialogOpen, setBeddingDialogOpen] = useState(false);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);

  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN' || role === 'CO' || role === 'CQMS';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Company Stores (CQMS)
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage laundry, boot, tailor, bedding, and repair books
            </p>
          </div>
        </div>

        <Tabs defaultValue="laundry" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="laundry" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Laundry
            </TabsTrigger>
            <TabsTrigger value="boot" className="flex items-center gap-2">
              <Footprints className="h-4 w-4" />
              Boot Book
            </TabsTrigger>
            <TabsTrigger value="tailor" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Tailor
            </TabsTrigger>
            <TabsTrigger value="bedding" className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Bedding
            </TabsTrigger>
            <TabsTrigger value="repair" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Repair
            </TabsTrigger>
          </TabsList>

          <TabsContent value="laundry">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Laundry Book</CardTitle>
                    <CardDescription>Track weekly laundry (max 25 articles, 3 KD garments per half bundle)</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setLaundryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <LaundryBookList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boot">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Boot Book (TTR Form 84)</CardTitle>
                    <CardDescription>Track boot repairs, condemnations, and exchanges</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setBootDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <BootBookList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tailor">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tailor Book</CardTitle>
                    <CardDescription>Track clothing repairs and alterations with signatures</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setTailorDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <TailorBookList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bedding">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bedding Book</CardTitle>
                    <CardDescription>Track weekly bedding checks</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setBeddingDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <BeddingBookList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repair">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Repair Book</CardTitle>
                    <CardDescription>Track accommodation and furniture damage and repairs</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setRepairDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <RepairBookList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <LaundryBookDialog
          open={laundryDialogOpen}
          onOpenChange={setLaundryDialogOpen}
          onSuccess={() => {
            // Refetch will be handled by list components
          }}
        />

        <BootBookDialog
          open={bootDialogOpen}
          onOpenChange={setBootDialogOpen}
          onSuccess={() => {}}
        />

        <TailorBookDialog
          open={tailorDialogOpen}
          onOpenChange={setTailorDialogOpen}
          onSuccess={() => {}}
        />

        <BeddingBookDialog
          open={beddingDialogOpen}
          onOpenChange={setBeddingDialogOpen}
          onSuccess={() => {}}
        />

        <RepairBookDialog
          open={repairDialogOpen}
          onOpenChange={setRepairDialogOpen}
          onSuccess={() => {}}
        />
      </main>
    </div>
  );
}

