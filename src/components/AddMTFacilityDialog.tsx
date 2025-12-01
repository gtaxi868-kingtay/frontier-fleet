import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddMTFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMTFacilityDialog({ open, onOpenChange, onSuccess }: AddMTFacilityDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="mt_facilities"
      moduleName="MT Facility"
      tableName="mt_facilities"
    />
  );
}
