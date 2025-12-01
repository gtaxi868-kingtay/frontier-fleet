import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFacilityDialog({ open, onOpenChange, onSuccess }: AddFacilityDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="facilities"
      moduleName="Facility"
      tableName="facilities"
    />
  );
}
