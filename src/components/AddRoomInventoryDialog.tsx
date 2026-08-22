import { BaseAddItemDialog } from "./BaseAddItemDialog";

interface AddRoomInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddRoomInventoryDialog({ open, onOpenChange, onSuccess }: AddRoomInventoryDialogProps) {
  return (
    <BaseAddItemDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      module="room_inventory"
      moduleName="Room Inventory Item"
      tableName="room_inventory"
    />
  );
}
