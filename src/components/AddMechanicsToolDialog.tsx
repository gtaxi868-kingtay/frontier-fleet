import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddMechanicsToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMechanicsToolDialog({ open, onOpenChange, onSuccess }: AddMechanicsToolDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="mechanics_tools"
      moduleName="Mechanics Tool"
      tableName="mechanics_tools"
    />
  );
}
