import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddUniformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUniformDialog({ open, onOpenChange, onSuccess }: AddUniformDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="uniforms"
      moduleName="Uniform"
      tableName="uniforms"
    />
  );
}
