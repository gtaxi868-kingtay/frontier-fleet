import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddEngineerEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEngineerEquipmentDialog({ open, onOpenChange, onSuccess }: AddEngineerEquipmentDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="engineer_equipment"
      moduleName="Engineer Equipment"
      tableName="engineer_equipment"
    />
  );
}
