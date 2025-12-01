import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddVehicleDialog({ open, onOpenChange, onSuccess }: AddVehicleDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="vehicles"
      moduleName="Vehicle"
      tableName="vehicles"
    />
  );
}
