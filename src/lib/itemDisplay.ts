// Every module's item-identity/display-name columns, in one place. Used
// anywhere a dialog needs to show "what item is this" for a row it doesn't
// know the shape of ahead of time (QuickIssueDialog, QuickReturnDialog,
// RecordTransactionDialog, Scan, etc).
//
// Add a new module's id/name columns here when wiring it into any of those
// shared dialogs - resist the temptation to add another local fallback
// chain, that's exactly how this list drifted out of sync per-module before.

const ID_FIELDS = [
  'item_id',       // general_inventory
  'weapon_id',
  'vehicle_id',
  'tool_id',        // tools, mechanics_tools
  'equip_id',       // engineer_equipment
  'plant_id',       // plant_machinery
  'ppe_id',
  'uniform_id',
  'voucher_id',     // works_materials
  'explosive_id',
  'facility_id',    // facilities, mt_facilities
  'room_id',        // room_inventory
] as const;

const NAME_FIELDS = [
  'item_name',      // general_inventory, uniforms
  'weapon_type',
  'vehicle_type',
  'tool_name',       // tools, mechanics_tools
  'equipment_name',  // engineer_equipment
  'type',            // plant_machinery, explosives
  'item',            // ppe
  'material',        // works_materials
  'facility_name',   // facilities, mt_facilities
  'room_type',       // room_inventory
] as const;

export function getItemDisplayId(item: any, fallback = 'N/A'): string {
  if (!item) return fallback;
  for (const field of ID_FIELDS) {
    if (item[field]) return String(item[field]);
  }
  return fallback;
}

export function getItemDisplayName(item: any, fallback = 'Unknown'): string {
  if (!item) return fallback;
  for (const field of NAME_FIELDS) {
    if (item[field]) return String(item[field]);
  }
  return fallback;
}
