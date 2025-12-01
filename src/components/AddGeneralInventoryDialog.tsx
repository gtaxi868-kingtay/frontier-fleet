import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddGeneralInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddGeneralInventoryDialog({ open, onOpenChange, onSuccess }: AddGeneralInventoryDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="general_inventory"
      moduleName="Inventory Item"
      tableName="general_inventory"
    />
  );
}