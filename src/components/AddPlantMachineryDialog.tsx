import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddPlantMachineryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPlantMachineryDialog({ open, onOpenChange, onSuccess }: AddPlantMachineryDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="plant_machinery"
      moduleName="Plant & Machinery"
      tableName="plant_machinery"
    />
  );
}
