import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddWorksMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddWorksMaterialDialog({ open, onOpenChange, onSuccess }: AddWorksMaterialDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="works_materials"
      moduleName="Works Material"
      tableName="works_materials"
    />
  );
}
