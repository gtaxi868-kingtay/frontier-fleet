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
