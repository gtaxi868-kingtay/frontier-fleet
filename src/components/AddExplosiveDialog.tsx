import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddExplosiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExplosiveDialog({ open, onOpenChange, onSuccess }: AddExplosiveDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="explosives"
      moduleName="Explosive"
      tableName="explosives"
    />
  );
}
