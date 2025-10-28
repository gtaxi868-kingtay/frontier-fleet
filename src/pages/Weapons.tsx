import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Camera, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";

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
  const [scanMode, setScanMode] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const [hasS4Role, setHasS4Role] = useState(false);
  const [weapons, setWeapons] = useState<any[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<WeaponFormData>({
    resolver: zodResolver(weaponSchema),
    defaultValues: {
      weapon_id: "",
      weapon_type: "",
      serial_number: "",
      rack_number: "",
      condition_issue: "Good",
      serviceable: true,
      notes: "",
    },
  });

  // Fetch weapons data
  const fetchWeapons = async () => {
    const { data, error } = await supabase.from("weapons").select("*");
    if (data) setWeapons(data);
  };

  // Check if user has S4 role
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
    fetchWeapons();
  }, [session]);

  const handleQRScan = (data: string) => {
    try {
      // Parse QR code data (expecting format: weaponId|weaponType|serialNumber|rackNumber)
      const parts = data.split("|");
      if (parts.length >= 2) {
        form.setValue("weapon_id", parts[0]);
        form.setValue("weapon_type", parts[1]);
        if (parts[2]) form.setValue("serial_number", parts[2]);
        if (parts[3]) form.setValue("rack_number", parts[3]);
        setScanMode(false);
        toast({
          title: "QR Code Scanned",
          description: "Weapon details loaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Invalid QR code format",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: WeaponFormData) => {
    try {
      const weaponData = {
        weapon_id: data.weapon_id,
        weapon_type: data.weapon_type,
        serial_number: data.serial_number || null,
        rack_number: data.rack_number || null,
        condition_issue: data.condition_issue || null,
        serviceable: data.serviceable,
        notes: data.notes || null,
      };

      const { error } = await supabase.from("weapons").insert([weaponData]);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Weapon added successfully",
      });
      
      setDialogOpen(false);
      form.reset();
      fetchWeapons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Weapons Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage battalion weapons inventory
            </p>
          </div>
          {hasS4Role && (
            <div className="flex gap-2">
              <BulkUploadDialog module="weapons" moduleName="Weapons" />
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Weapon
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Weapon</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Manual Entry
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="gap-2">
                      <Camera className="h-4 w-4" />
                      QR Scan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="weapon_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weapon ID *</FormLabel>
                              <FormControl>
                                <Input placeholder="W-001" {...field} />
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
                              <FormLabel>Weapon Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select weapon type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Rifle">Rifle</SelectItem>
                                  <SelectItem value="Pistol">Pistol</SelectItem>
                                  <SelectItem value="Machine Gun">Machine Gun</SelectItem>
                                  <SelectItem value="Grenade Launcher">Grenade Launcher</SelectItem>
                                  <SelectItem value="Sniper Rifle">Sniper Rifle</SelectItem>
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
                                <Input placeholder="SN123456" {...field} />
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
                                <Input placeholder="R-01" {...field} />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Excellent">Excellent</SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Fair">Fair</SelectItem>
                                  <SelectItem value="Poor">Poor</SelectItem>
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
                                <Textarea placeholder="Additional notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">Add Weapon</Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="qr" className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                      {scanMode ? (
                        <div className="relative">
                          <QrReader
                            onResult={(result, error) => {
                              if (result) {
                                handleQRScan(result.getText());
                              }
                            }}
                            constraints={{ facingMode: "environment" }}
                            className="w-full"
                          />
                          <Button
                            onClick={() => setScanMode(false)}
                            className="absolute top-4 right-4"
                            variant="secondary"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Scan QR code to automatically fill weapon details
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            QR format: WeaponID|WeaponType|SerialNumber|RackNumber
                          </p>
                          <Button
                            onClick={() => setScanMode(true)}
                            className="mb-4"
                            variant="outline"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                          </Button>
                          <Input
                            placeholder="Or paste QR data here"
                            onChange={(e) => handleQRScan(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="weapon_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weapon ID *</FormLabel>
                              <FormControl>
                                <Input placeholder="Scanned from QR" {...field} readOnly />
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
                              <FormLabel>Weapon Type *</FormLabel>
                              <FormControl>
                                <Input placeholder="Scanned from QR" {...field} readOnly />
                              </FormControl>
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
                                <Input placeholder="Scanned from QR" {...field} readOnly />
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
                                <Input placeholder="Scanned from QR" {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">Add Weapon</Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weapons Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search weapons..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const filteredWeapons = weapons.filter(weapon => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  weapon.weapon_id?.toLowerCase().includes(searchLower) ||
                  weapon.weapon_type?.toLowerCase().includes(searchLower) ||
                  weapon.serial_number?.toLowerCase().includes(searchLower) ||
                  weapon.rack_number?.toLowerCase().includes(searchLower)
                );
              });
              
              return filteredWeapons.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {searchTerm ? "No weapons match your search." : "No weapons data available. Add weapons to get started."}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWeapons.map((weapon) => (
                  <Card 
                    key={weapon.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-primary/50"
                    onClick={() => {
                      setSelectedWeapon(weapon);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {weapon.weapon_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-tactical uppercase text-muted-foreground">Type</span>
                        <span className="font-medium">{weapon.weapon_type}</span>
                      </div>
                      {weapon.serial_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-tactical uppercase text-muted-foreground">Serial</span>
                          <span className="font-medium text-sm">{weapon.serial_number}</span>
                        </div>
                      )}
                      {weapon.rack_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-tactical uppercase text-muted-foreground">Rack</span>
                          <span className="font-medium">{weapon.rack_number}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Badge variant={weapon.serviceable ? 'default' : 'destructive'} className="w-full justify-center">
                          {weapon.serviceable ? 'Serviceable' : 'Unserviceable'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedWeapon ? `${selectedWeapon.weapon_id} - ${selectedWeapon.weapon_type}` : ''}
          data={selectedWeapon}
        />
      </main>
    </div>
  );
}
