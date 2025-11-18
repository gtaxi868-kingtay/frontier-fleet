import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, QrCode, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { ItemLookupDialog } from "@/components/ItemLookupDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { RealtimeInventorySync } from "@/components/RealtimeInventorySync";
import { useInventoryData } from "@/hooks/useInventoryData";

const weaponSchema = z.object({
  weapon_id: z.string().min(1, "Weapon ID is required"),
  weapon_type: z.string().min(1, "Weapon type is required"),
  serial_number: z.string().nullable().optional(),
  rack_number: z.string().nullable().optional(),
  condition_issue: z.string().nullable().optional(),
  serviceable: z.boolean().default(true),
  notes: z.string().nullable().optional(),
});

type WeaponFormData = z.infer<typeof weaponSchema>;

export default function Weapons() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrGenOpen, setQrGenOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const { session } = useAuth();
  const [hasS4Role, setHasS4Role] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: weapons = [], isLoading, refetch, create } = useInventoryData('weapons');

  const form = useForm<WeaponFormData>({
    resolver: zodResolver(weaponSchema),
    defaultValues: {
      weapon_id: "",
      weapon_type: "",
      serial_number: "",
      rack_number: "",
      condition_issue: "SERVICEABLE",
      serviceable: true,
      notes: "",
    },
  });

  useEffect(() => {
    const checkRole = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "S4")
        .eq("status", "approved")
        .single();
      setHasS4Role(!!data);
    };
    checkRole();
  }, [session]);

  const handleQRScan = (data: string) => {
    try {
      const parts = data.split("|");
      if (parts.length >= 2) {
        form.setValue("weapon_id", parts[0]);
        form.setValue("weapon_type", parts[1]);
        if (parts[2]) form.setValue("serial_number", parts[2]);
        if (parts[3]) form.setValue("rack_number", parts[3]);
      }
    } catch (error) {
      console.error("QR scan error:", error);
    }
  };

  const onSubmit = (data: WeaponFormData) => {
    const weaponData = {
      weapon_id: data.weapon_id,
      weapon_type: data.weapon_type,
      serial_number: data.serial_number || null,
      rack_number: data.rack_number || null,
      condition_issue: data.condition_issue || "SERVICEABLE",
      serviceable: data.serviceable,
      notes: data.notes || null,
    };

    create(weaponData, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      },
    });
  };

  const filteredWeapons = weapons.filter((weapon: any) =>
    weapon.weapon_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weapon.weapon_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weapon.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Weapons Management</h1>
            <p className="text-muted-foreground">Manage battalion weapons inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Weapon
            </Button>
            <Button onClick={() => setLookupOpen(true)} variant="outline">
              <Scan className="mr-2 h-4 w-4" />
              Quick Lookup
            </Button>
            {hasS4Role && (
              <BulkUploadDialog
                tableName="weapons"
                onSuccess={refetch}
              />
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weapons Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search weapons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading weapons...</div>
            ) : filteredWeapons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No weapons found
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWeapons.map((weapon: any) => (
                  <Card key={weapon.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {weapon.weapon_type}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            ID: {weapon.weapon_id}
                          </p>
                        </div>
                        <Badge variant={weapon.serviceable ? "default" : "destructive"}>
                          {weapon.serviceable ? "Serviceable" : "Unserviceable"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {weapon.serial_number && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Serial:</span> {weapon.serial_number}
                        </p>
                      )}
                      {weapon.rack_number && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Rack:</span> {weapon.rack_number}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWeapon(weapon);
                            setDetailDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWeapon(weapon);
                            setQrGenOpen(true);
                          }}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Weapon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              onClick={() => setScannerOpen(true)}
              variant="outline"
              className="w-full"
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan QR Code to Auto-Fill
            </Button>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="weapon_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weapon ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weapon_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weapon Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weapon type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rifle">Rifle</SelectItem>
                          <SelectItem value="Pistol">Pistol</SelectItem>
                          <SelectItem value="Machine Gun">Machine Gun</SelectItem>
                          <SelectItem value="Shotgun">Shotgun</SelectItem>
                          <SelectItem value="Grenade Launcher">Grenade Launcher</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rack_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rack Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition_issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "SERVICEABLE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SERVICEABLE">Serviceable</SelectItem>
                          <SelectItem value="UNSERVICEABLE">Unserviceable</SelectItem>
                          <SelectItem value="UNDER_REPAIR">Under Repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Weapon</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
        title="Scan Weapon QR Code"
        description="Scan the QR code to auto-fill weapon details"
      />

      {selectedWeapon && (
        <>
          <ItemDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            title={`${selectedWeapon.weapon_type} - ${selectedWeapon.weapon_id}`}
            data={selectedWeapon}
          />
          <QRCodeGenerator
            open={qrGenOpen}
            onOpenChange={setQrGenOpen}
            data={selectedWeapon}
            itemType="weapons"
          />
        </>
      )}

      <ItemLookupDialog open={lookupOpen} onOpenChange={setLookupOpen} />
      
      <RealtimeInventorySync tableName="weapons" onUpdate={refetch} />
    </div>
  );
}
