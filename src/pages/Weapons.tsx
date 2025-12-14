import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, QrCode, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { WeaponStatusEditDialog } from "@/components/WeaponStatusEditDialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatIssuedTo, getItemStatus } from "@/lib/statusUtils";
import { RealtimeInventorySync } from "@/components/RealtimeInventorySync";
import { useInventoryData } from "@/hooks/useInventoryData";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { QRCodeLabel } from "@/components/QRCodeLabel";
import { useItemLookup } from "@/hooks/useItemLookup";
import { decodeQRData, type QRCodeData } from "@/lib/qr-utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { lookupSoldier } from "@/hooks/useSoldierLookup";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { useDebouncedDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const weaponSchema = z.object({
  weapon_id: z.string().min(1, "Weapon ID is required"),
  weapon_type: z.string().min(1, "Weapon type is required"),
  serial_number: z.string().nullable().optional(),
  rack_number: z.string().nullable().optional(),
  condition_issue: z.string().nullable().optional(),
  serviceable: z.boolean().default(true),
  notes: z.string().nullable().optional(),
  store_location: z.string().nullable().optional(),
  service_number: z.string().nullable().optional(),
  rank: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  mag_amount: z.number().nullable().optional(),
  page_64_no: z.string().nullable().optional(),
});

type WeaponFormData = z.infer<typeof weaponSchema>;

export default function Weapons() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { session, role } = useAuth();
  const canManage = ['S4', 'S4_ADMIN', 'SQMS', 'STOREMAN'].includes(role || '');
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelData, setLabelData] = useState<QRCodeData | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; updates: any } | null>(null);
  const [statusEditDialogOpen, setStatusEditDialogOpen] = useState(false);
  const [weaponForStatusEdit, setWeaponForStatusEdit] = useState<any>(null);

  const handleStatusChange = (weapon: any, newServiceable: boolean) => {
    setPendingUpdate({
      id: weapon.id,
      updates: { serviceable: newServiceable }
    });
    setConfirmOpen(true);
  };

  const handleStatusClick = (field: string) => {
    if (selectedWeapon) {
      setWeaponForStatusEdit(selectedWeapon);
      setStatusEditDialogOpen(true);
    }
  };

  const handleStatusSave = (updates: { condition_issue: string; serviceable: boolean }) => {
    if (!weaponForStatusEdit) return;
    
    update({
      id: weaponForStatusEdit.id,
      updates: updates,
    });
    
    // Update selectedWeapon to reflect changes immediately
    if (selectedWeapon && selectedWeapon.id === weaponForStatusEdit.id) {
      setSelectedWeapon({
        ...selectedWeapon,
        ...updates,
      });
    }
    
    // Close dialog and reset state
    setStatusEditDialogOpen(false);
    setWeaponForStatusEdit(null);
  };
  
  const { data: weapons = [], isLoading, refetch, create, update } = useInventoryData('weapons');
  const { lookupItem } = useItemLookup();
  const { profile } = useAuth();

  const { currentUnitId } = useUnitFilter();

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
      store_location: "",
      service_number: "",
      rank: "",
      name: "",
      mag_amount: null,
      page_64_no: "",
    },
  });

  // Watch weapon_id for duplicate checking
  const weaponIdValue = form.watch("weapon_id");
  const weaponUnitId = currentUnitId || profile?.unit_id || null;
  
  // Duplicate check with debounce
  const { exists: idExists, suggestedId, isLoading: checkingDuplicate } = useDebouncedDuplicateCheck(
    'weapons',
    weaponIdValue || '',
    dialogOpen && !!weaponIdValue,
    weaponUnitId,
    500
  );

  // Set form error if duplicate exists
  useEffect(() => {
    if (idExists && weaponIdValue && weaponIdValue.trim().length > 0) {
      form.setError('weapon_id', {
        type: 'manual',
        message: `This weapon ID already exists. ${suggestedId ? `Suggested: ${suggestedId}` : ''}`,
      });
    } else if (!idExists && weaponIdValue && weaponIdValue.trim().length > 0) {
      form.clearErrors('weapon_id');
    }
  }, [idExists, suggestedId, weaponIdValue, form]);

  // Role check now handled via useAuth().role directly with canManage variable

  const handleQRScan = async (qrString: string) => {
    const decoded = decodeQRData(qrString);
    if (!decoded || decoded.module !== 'weapons') {
      toast.error('Invalid QR code for weapons');
      return;
    }

    const result = await lookupItem('weapons', decoded.id);
    if (result.found && result.item) {
      setSelectedWeapon(result.item);
      setDetailDialogOpen(true);
    }
  };

  const handleGenerateLabel = (weapon: any) => {
    const labelData: QRCodeData = {
      module: 'weapons',
      id: weapon.weapon_id,
      name: weapon.weapon_type,
      additionalInfo: weapon.serial_number || undefined,
    };
    setLabelData(labelData);
    setLabelOpen(true);
  };

  const onSubmit = async (data: WeaponFormData) => {
    // Prevent submission if duplicate exists
    if (idExists) {
      toast.error('Cannot add weapon: This weapon ID already exists.');
      return;
    }

    // Lookup soldier profile if name, rank, or service_number provided
    let soldierProfile = null;
    let weaponUnitId = currentUnitId || profile?.unit_id || null;

    if (data.name || data.rank || data.service_number) {
      const lookupResult = await lookupSoldier(
        data.service_number || null,
        data.rank || null,
        data.name || null
      );

      if (lookupResult.found && lookupResult.profile) {
        soldierProfile = lookupResult.profile;
        // Auto-sync weapon unit to match soldier unit if found
        weaponUnitId = soldierProfile.unit_id || weaponUnitId;
      }
    }

    const weaponData: any = {
      weapon_id: data.weapon_id,
      weapon_type: data.weapon_type,
      serial_number: data.serial_number || null,
      rack_number: data.rack_number || null,
      condition_issue: data.condition_issue || "SERVICEABLE",
      serviceable: data.serviceable,
      notes: data.notes || null,
      store_location: data.store_location || null,
      service_number: data.service_number || null,
      rank: data.rank || null,
      name: data.name || null,
      mag_amount: data.mag_amount || null,
      page_64_no: data.page_64_no || null,
      squadron_id: weaponUnitId,
      // Link to soldier profile if found
      issued_to: soldierProfile?.id || null,
    };

    create(weaponData, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
        toast.success('Weapon added successfully' + (soldierProfile ? ` and linked to ${soldierProfile.name}` : ''));
      },
    });
  };

  const filteredWeapons = weapons.filter((weapon: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      weapon.weapon_id?.toLowerCase().includes(searchLower) ||
      weapon.weapon_type?.toLowerCase().includes(searchLower) ||
      weapon.serial_number?.toLowerCase().includes(searchLower) ||
      weapon.store_location?.toLowerCase().includes(searchLower) ||
      weapon.name?.toLowerCase().includes(searchLower) ||
      weapon.service_number?.toLowerCase().includes(searchLower) ||
      weapon.rack_number?.toLowerCase().includes(searchLower)
    );
  });

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
            <Button
              variant="outline"
              onClick={() => setScannerOpen(true)}
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Weapon
            </Button>
            {canManage && (
              <BulkUploadDialog
                module="weapons"
                moduleName="Weapons"
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
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={weapon.issued_to ? 'issued' : (weapon.condition_issue?.toLowerCase().replace('_', '') || (weapon.serviceable ? 'serviceable' : 'unserviceable'))}
                            type={weapon.issued_to ? 'availability' : 'serviceability'}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {weapon.unit && (
                        <p className="text-sm font-medium">
                          <span className="text-muted-foreground">Unit:</span> {typeof weapon.unit === 'object' ? weapon.unit?.name : weapon.unit}
                        </p>
                      )}
                      {weapon.store_location && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Store:</span> {weapon.store_location}
                        </p>
                      )}
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
                      {(weapon.name || weapon.rank || weapon.service_number) && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Issued To:</p>
                          {weapon.rank && (
                            <p className="text-sm font-medium">{weapon.rank} {weapon.name || ''}</p>
                          )}
                          {weapon.service_number && (
                            <p className="text-xs text-muted-foreground">SN: {weapon.service_number}</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWeapon(weapon);
                            setDetailDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateLabel(weapon);
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="weapon_id"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Weapon ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className={weaponIdValue && weaponIdValue.trim().length > 0 ? "pr-10" : ""}
                        />
                      </FormControl>
                      {weaponIdValue && weaponIdValue.trim().length > 0 && (
                        <div className="absolute right-3 top-8 pointer-events-none">
                          {checkingDuplicate ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : idExists ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                      <FormMessage />
                      {idExists && suggestedId && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          This ID exists. Suggestion:{' '}
                          <button
                            type="button"
                            onClick={() => form.setValue('weapon_id', suggestedId, { shouldValidate: true })}
                            className="text-primary hover:underline font-medium"
                          >
                            {suggestedId}
                          </button>
                        </p>
                      )}
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
                  name="store_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store / Location</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="e.g., Alpha Coy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="service_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Number (NO.)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mag_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MAG Amt</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="page_64_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>64 PAGE NO</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="condition_issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "SERVICEABLE"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SERVICEABLE">Serviceable</SelectItem>
                            <SelectItem value="UNSERVICEABLE">Unserviceable</SelectItem>
                            <SelectItem value="UNDER_REPAIR">Under Repair</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                  <Button type="submit" disabled={checkingDuplicate || idExists}>
                    Add Weapon
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {selectedWeapon && (
        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={`${selectedWeapon.weapon_type} - ${selectedWeapon.weapon_id}`}
          data={selectedWeapon}
          module="weapons"
          onStatusClick={handleStatusClick}
        />
      )}

      <WeaponStatusEditDialog
        open={statusEditDialogOpen}
        onOpenChange={(open) => {
          setStatusEditDialogOpen(open);
          if (!open) {
            setWeaponForStatusEdit(null);
          }
        }}
        weapon={weaponForStatusEdit}
        onSave={handleStatusSave}
      />

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQRScan}
        title="Scan Weapon QR Code"
        description="Scan a weapon QR code to quickly look up item details"
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
        description="Are you sure you want to update this weapon? This action will be logged in the audit trail with your user details and timestamp."
      />
      
      <RealtimeInventorySync module="weapons" onDataChange={refetch} />
    </div>
  );
}
