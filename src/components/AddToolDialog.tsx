import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddToolDialog({ open, onOpenChange, onSuccess }: AddToolDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="tools"
      moduleName="Tool"
      tableName="tools"
    />
  );
}
