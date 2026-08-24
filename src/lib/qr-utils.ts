// Pure utility functions for QR code data encoding/decoding
// No component dependencies - just data transformation

export type InventoryModule = 
  | 'weapons' 
  | 'tools' 
  | 'vehicles'
  | 'engineer_equipment'
  | 'plant_machinery'
  | 'mechanics_tools'
  | 'mt_facilities'
  | 'ppe'
  | 'uniforms'
  | 'explosives'
  | 'facilities'
  | 'works_materials'
  | 'general_inventory'
  | 'room_inventory';

export interface QRCodeData {
  module: InventoryModule;
  id: string;
  name: string;
  additionalInfo?: string;
}

// Encode item data into QR string format
export function encodeQRData(data: QRCodeData): string {
  const parts = [data.module, data.id, data.name];
  if (data.additionalInfo) {
    parts.push(data.additionalInfo);
  }
  return parts.join('|');
}

// Decode QR string into structured data
export function decodeQRData(qrString: string): QRCodeData | null {
  try {
    const parts = qrString.split('|');
    if (parts.length < 3) {
      return null;
    }

    return {
      module: parts[0] as InventoryModule,
      id: parts[1],
      name: parts[2],
      additionalInfo: parts[3] || undefined,
    };
  } catch (error) {
    console.error('Failed to decode QR data:', error);
    return null;
  }
}

// DB column holding the item's unique ID, per module
export function getIdField(module: InventoryModule): string {
  const idFields: Record<InventoryModule, string> = {
    weapons: 'weapon_id',
    tools: 'tool_id',
    vehicles: 'vehicle_id',
    engineer_equipment: 'equip_id',
    plant_machinery: 'plant_id',
    mechanics_tools: 'tool_id',
    mt_facilities: 'facility_id',
    ppe: 'ppe_id',
    uniforms: 'uniform_id',
    explosives: 'explosive_id',
    facilities: 'facility_id',
    works_materials: 'voucher_id',
    general_inventory: 'item_id',
    room_inventory: 'room_id',
  };
  return idFields[module] || 'id';
}

// DB column holding the item's display name, per module
export function getNameField(module: InventoryModule): string {
  const nameFields: Record<InventoryModule, string> = {
    weapons: 'weapon_type',
    tools: 'tool_name',
    vehicles: 'vehicle_type',
    engineer_equipment: 'equipment_name',
    plant_machinery: 'type',
    mechanics_tools: 'tool_name',
    mt_facilities: 'facility_name',
    ppe: 'item',
    uniforms: 'item_name',
    explosives: 'type',
    facilities: 'facility_name',
    works_materials: 'material',
    general_inventory: 'item_name',
    room_inventory: 'room_type',
  };
  return nameFields[module] || 'name';
}

// Get display name for module
export function getModuleDisplayName(module: InventoryModule): string {
  const moduleNames: Record<InventoryModule, string> = {
    weapons: 'Weapons',
    tools: 'Tools',
    vehicles: 'Vehicles',
    engineer_equipment: 'Engineer Equipment',
    plant_machinery: 'Plant Machinery',
    mechanics_tools: 'Mechanics Tools',
    mt_facilities: 'MT Facilities',
    ppe: 'PPE',
    uniforms: 'Uniforms',
    explosives: 'Explosives',
    facilities: 'Facilities',
    works_materials: 'Works Materials',
    general_inventory: 'General Inventory',
    room_inventory: 'Room Inventory',
  };
  return moduleNames[module] || module;
}
