import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddPPEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPPEDialog({ open, onOpenChange, onSuccess }: AddPPEDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="ppe"
      moduleName="PPE Item"
      tableName="ppe"
    />
  );
}
