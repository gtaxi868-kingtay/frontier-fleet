/**
 * Field configuration for Add Item dialogs
 * Defines field types, labels, placeholders, options, etc.
 */

export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'date' | 'boolean';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  gridCols?: number; // 1 or 2 for grid layout
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // For textarea
}

/**
 * Tool fields configuration
 */
export const toolFields: FieldConfig[] = [
  {
    name: 'tool_id',
    label: 'Tool ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., TOOL-001',
    helpText: 'Unique identifier for this tool',
    gridCols: 1,
  },
  {
    name: 'tool_name',
    label: 'Tool Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Hammer, Drill',
    gridCols: 1,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Hand Tools', label: 'Hand Tools' },
      { value: 'Power Tools', label: 'Power Tools' },
      { value: 'Measuring Tools', label: 'Measuring Tools' },
      { value: 'Cutting Tools', label: 'Cutting Tools' },
      { value: 'Specialist Tools', label: 'Specialist Tools' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'serviceable',
    label: 'Serviceable',
    type: 'boolean',
    required: false,
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Uniform fields configuration
 */
export const uniformFields: FieldConfig[] = [
  {
    name: 'uniform_id',
    label: 'Uniform ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., UNIFORM-001',
    helpText: 'Unique identifier for this uniform',
    gridCols: 1,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    placeholder: 'Select category',
    options: [
      { value: 'Headwear', label: 'Headwear' },
      { value: 'Tops', label: 'Tops' },
      { value: 'Bottoms', label: 'Bottoms' },
      { value: 'Footwear', label: 'Footwear' },
      { value: 'Accessories', label: 'Accessories' },
      { value: 'Complete Sets', label: 'Complete Sets' },
    ],
    gridCols: 1,
  },
  {
    name: 'item_name',
    label: 'Item Name',
    type: 'select',
    required: true,
    placeholder: 'Select item',
    options: [
      // Headwear
      { value: 'Forage Cap', label: 'Forage Cap' },
      { value: 'Beret (Green)', label: 'Beret (Green)' },
      { value: 'Beret (Black)', label: 'Beret (Black)' },
      { value: 'Service Dress Cap', label: 'Service Dress Cap' },
      { value: 'Boonie Hat', label: 'Boonie Hat' },
      { value: 'Regiment Cap', label: 'Regiment Cap' },
      { value: 'Combat Helmet (PASGT)', label: 'Combat Helmet (PASGT)' },
      // Tops
      { value: 'BDU Jacket (Camouflage)', label: 'BDU Jacket (Camouflage)' },
      { value: 'Green Jacket', label: 'Green Jacket' },
      { value: 'Khaki Jacket', label: 'Khaki Jacket' },
      { value: 'White Tunic', label: 'White Tunic' },
      { value: 'Service Dress Jacket', label: 'Service Dress Jacket' },
      { value: 'Bush Jacket', label: 'Bush Jacket' },
      { value: 'Olive Drab Shirt', label: 'Olive Drab Shirt' },
      { value: 'Mint Green Shirt (Long Sleeve)', label: 'Mint Green Shirt (Long Sleeve)' },
      { value: 'Mint Green Shirt (Short Sleeve)', label: 'Mint Green Shirt (Short Sleeve)' },
      { value: 'Khaki Shirt', label: 'Khaki Shirt' },
      { value: 'PT Vest (Red/White)', label: 'PT Vest (Red/White)' },
      { value: 'PT Vest (Green)', label: 'PT Vest (Green)' },
      { value: 'Green Under Vest (V Neck)', label: 'Green Under Vest (V Neck)' },
      { value: 'Green Under Vest (Round Neck)', label: 'Green Under Vest (Round Neck)' },
      { value: 'White Under Vest', label: 'White Under Vest' },
      { value: 'Black Under Vest', label: 'Black Under Vest' },
      { value: 'Jersey Pullover (Olive Green)', label: 'Jersey Pullover (Olive Green)' },
      { value: 'Coverall (Olive Drab)', label: 'Coverall (Olive Drab)' },
      // Bottoms
      { value: 'BDU Trousers (Camouflage)', label: 'BDU Trousers (Camouflage)' },
      { value: 'Green Pants', label: 'Green Pants' },
      { value: 'Khaki Pants', label: 'Khaki Pants' },
      { value: 'White Trousers', label: 'White Trousers' },
      { value: 'Olive Drab Trousers', label: 'Olive Drab Trousers' },
      { value: 'PT Shorts (Black)', label: 'PT Shorts (Black)' },
      { value: 'PT Pants (Black)', label: 'PT Pants (Black)' },
      { value: 'Green Skirt', label: 'Green Skirt' },
      { value: 'Khaki Skirt', label: 'Khaki Skirt' },
      { value: 'White Skirt', label: 'White Skirt' },
      // Footwear
      { value: 'Combat Boots (Rubber Sole)', label: 'Combat Boots (Rubber Sole)' },
      { value: 'Chelsea Boots (Black)', label: 'Chelsea Boots (Black)' },
      { value: 'Chelsea Boots (Brown)', label: 'Chelsea Boots (Brown)' },
      { value: 'Leather Soled Boots', label: 'Leather Soled Boots' },
      { value: 'Dress Shoes (Black)', label: 'Dress Shoes (Black)' },
      { value: 'Court Shoes (Black)', label: 'Court Shoes (Black)' },
      { value: 'High Heel Shoes (Black)', label: 'High Heel Shoes (Black)' },
      { value: 'High Heel Shoes (Brown)', label: 'High Heel Shoes (Brown)' },
      { value: 'Track Sneakers', label: 'Track Sneakers' },
      { value: 'Sneakers (White/Blue)', label: 'Sneakers (White/Blue)' },
      { value: 'Sneakers (Black)', label: 'Sneakers (Black)' },
      // Accessories
      { value: 'Belt (Staple)', label: 'Belt (Staple)' },
      { value: 'Belt (Green Courlene)', label: 'Belt (Green Courlene)' },
      { value: 'Belt (White Courlene)', label: 'Belt (White Courlene)' },
      { value: 'Belt (Green Felt 1.5")', label: 'Belt (Green Felt 1.5")' },
      { value: 'Belt (Khaki Felt 1.5")', label: 'Belt (Khaki Felt 1.5")' },
      { value: 'Belt (Black Dress)', label: 'Belt (Black Dress)' },
      { value: 'Sam Browne Belt', label: 'Sam Browne Belt' },
      { value: 'Sash Belt (Ceremonial)', label: 'Sash Belt (Ceremonial)' },
      { value: 'Belt Sash Tussle (Officer)', label: 'Belt Sash Tussle (Officer)' },
      { value: 'Lanyard (Green)', label: 'Lanyard (Green)' },
      { value: 'Lanyard (Blue)', label: 'Lanyard (Blue)' },
      { value: 'Scarlet Shoulder Sash', label: 'Scarlet Shoulder Sash' },
      { value: 'Shoulder Titles (TTR)', label: 'Shoulder Titles (TTR)' },
      { value: 'Collar Badges (Dogs)', label: 'Collar Badges (Dogs)' },
      { value: 'Regiment Buttons (Large)', label: 'Regiment Buttons (Large)' },
      { value: 'Regiment Buttons (Medium)', label: 'Regiment Buttons (Medium)' },
      { value: 'Regiment Buttons (Small)', label: 'Regiment Buttons (Small)' },
      { value: 'Stockings (Charcoal)', label: 'Stockings (Charcoal)' },
      { value: 'Stockings (Cedar Brown)', label: 'Stockings (Cedar Brown)' },
      { value: 'Socks (Green)', label: 'Socks (Green)' },
      { value: 'Socks (Khaki)', label: 'Socks (Khaki)' },
      { value: 'Socks (Black)', label: 'Socks (Black)' },
      { value: 'Tights (Spandex)', label: 'Tights (Spandex)' },
      { value: 'Tie (Green Knitted)', label: 'Tie (Green Knitted)' },
      { value: 'Tie (Green with Regiment Logo)', label: 'Tie (Green with Regiment Logo)' },
      { value: 'Bow Tie', label: 'Bow Tie' },
      { value: 'Epaulettes (Corded)', label: 'Epaulettes (Corded)' },
      { value: 'Epaulettes (Corded Gold)', label: 'Epaulettes (Corded Gold)' },
      // Complete Sets (for reference)
      { value: 'Combat Uniform Set (No#4D)', label: 'Combat Uniform Set (No#4D)' },
      { value: 'Ceremonial Uniform Set (No#1)', label: 'Ceremonial Uniform Set (No#1)' },
      { value: 'Service Dress Set (No#2)', label: 'Service Dress Set (No#2)' },
      { value: 'Working Dress Set (No#3)', label: 'Working Dress Set (No#3)' },
      { value: 'Parade Order Set (No#5)', label: 'Parade Order Set (No#5)' },
      { value: 'PT Uniform Set (No#10A)', label: 'PT Uniform Set (No#10A)' },
      { value: 'Battle PT Set (No#10B)', label: 'Battle PT Set (No#10B)' },
    ],
    gridCols: 1,
  },
  {
    name: 'size',
    label: 'Size',
    type: 'select',
    required: false,
    placeholder: 'Select size',
    options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
      { value: 'N/A', label: 'N/A' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    helpText: 'Number of items currently in stock',
    gridCols: 1,
  },
  {
    name: 'qty_issued',
    label: 'Quantity Issued',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    helpText: 'Number of items currently issued',
    gridCols: 1,
    disabled: true, // Auto-calculated, not directly editable
  },
  {
    name: 'qty_returned',
    label: 'Quantity Returned',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    helpText: 'Total number of items returned',
    gridCols: 1,
    disabled: true, // Auto-calculated, not directly editable
  },
  {
    name: 'serviceable',
    label: 'Serviceable',
    type: 'boolean',
    required: false,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * PPE fields configuration
 */
export const ppeFields: FieldConfig[] = [
  {
    name: 'ppe_id',
    label: 'PPE ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., PPE-001',
    helpText: 'Unique identifier for this PPE item',
    gridCols: 1,
  },
  {
    name: 'item',
    label: 'Item Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Safety Helmet',
    gridCols: 1,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Head Protection', label: 'Head Protection' },
      { value: 'Eye Protection', label: 'Eye Protection' },
      { value: 'Hearing Protection', label: 'Hearing Protection' },
      { value: 'Body Protection', label: 'Body Protection' },
      { value: 'Hand Protection', label: 'Hand Protection' },
      { value: 'Foot Protection', label: 'Foot Protection' },
      { value: 'Respiratory Protection', label: 'Respiratory Protection' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'serviceable',
    label: 'Serviceable',
    type: 'boolean',
    required: false,
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Vehicle fields configuration
 */
export const vehicleFields: FieldConfig[] = [
  {
    name: 'vehicle_id',
    label: 'Vehicle ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., VEH-001',
    helpText: 'Unique identifier for this vehicle',
    gridCols: 1,
  },
  {
    name: 'vehicle_type',
    label: 'Vehicle Type',
    type: 'text',
    required: true,
    placeholder: 'e.g., Truck, Jeep',
    gridCols: 1,
  },
  {
    name: 'make_model',
    label: 'Make & Model',
    type: 'text',
    required: false,
    placeholder: 'e.g., Toyota Hilux',
    gridCols: 1,
  },
  {
    name: 'registration_number',
    label: 'Registration Number',
    type: 'text',
    required: false,
    placeholder: 'e.g., P-1234',
    gridCols: 1,
  },
  {
    name: 'serial_number',
    label: 'Serial Number',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'serviceability',
    label: 'Serviceability',
    type: 'select',
    required: false,
    options: [
      { value: 'Serviceable', label: 'Serviceable' },
      { value: 'Unserviceable', label: 'Unserviceable' },
      { value: 'Under Repair', label: 'Under Repair' },
      { value: 'Awaiting Parts', label: 'Awaiting Parts' },
    ],
    gridCols: 1,
  },
  {
    name: 'fuel_type',
    label: 'Fuel Type',
    type: 'select',
    required: false,
    options: [
      { value: 'Petrol', label: 'Petrol' },
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Hybrid', label: 'Hybrid' },
    ],
    gridCols: 1,
  },
  {
    name: 'last_service_date',
    label: 'Last Service Date',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'next_service_due',
    label: 'Next Service Due',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'mileage',
    label: 'Mileage',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Engineer Equipment fields configuration
 */
export const engineerEquipmentFields: FieldConfig[] = [
  {
    name: 'equip_id',
    label: 'Equipment ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., ENG-001',
    helpText: 'Unique identifier for this equipment',
    gridCols: 1,
  },
  {
    name: 'equipment_name',
    label: 'Equipment Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Bridge Assembly Kit',
    gridCols: 1,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'Bridging Equipment', label: 'Bridging Equipment' },
      { value: 'Construction Equipment', label: 'Construction Equipment' },
      { value: 'Demolition Equipment', label: 'Demolition Equipment' },
      { value: 'Surveying Equipment', label: 'Surveying Equipment' },
      { value: 'Water Supply Equipment', label: 'Water Supply Equipment' },
      { value: 'Other', label: 'Other' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'serviceable',
    label: 'Serviceable',
    type: 'boolean',
    required: false,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * General Inventory fields configuration
 */
export const generalInventoryFields: FieldConfig[] = [
  {
    name: 'item_id',
    label: 'Item ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., INV-001',
    helpText: 'Unique identifier for this item',
    gridCols: 1,
  },
  {
    name: 'item_name',
    label: 'Item Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Office Supplies',
    gridCols: 1,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Stationery', label: 'Stationery' },
      { value: 'Cleaning Supplies', label: 'Cleaning Supplies' },
      { value: 'Office Supplies', label: 'Office Supplies' },
      { value: 'Medical Supplies', label: 'Medical Supplies' },
      { value: 'Food & Beverages', label: 'Food & Beverages' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Other', label: 'Other' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'reorder_level',
    label: 'Reorder Level',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    helpText: 'Alert when stock falls below this level',
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Plant Machinery fields configuration
 */
export const plantMachineryFields: FieldConfig[] = [
  {
    name: 'plant_id',
    label: 'Plant ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., PLANT-001',
    helpText: 'Unique identifier for this plant/machinery',
    gridCols: 1,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'Excavator', label: 'Excavator' },
      { value: 'Bulldozer', label: 'Bulldozer' },
      { value: 'Grader', label: 'Grader' },
      { value: 'Loader', label: 'Loader' },
      { value: 'Compactor', label: 'Compactor' },
      { value: 'Crane', label: 'Crane' },
      { value: 'Generator', label: 'Generator' },
    ],
    gridCols: 1,
  },
  {
    name: 'make_model',
    label: 'Make/Model',
    type: 'text',
    required: false,
    placeholder: 'e.g., Caterpillar D6',
    gridCols: 1,
  },
  {
    name: 'serial_number',
    label: 'Serial Number',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'fuel_type',
    label: 'Fuel Type',
    type: 'select',
    required: false,
    options: [
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Petrol', label: 'Petrol' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Hybrid', label: 'Hybrid' },
    ],
    gridCols: 1,
  },
  {
    name: 'serviceability',
    label: 'Serviceability',
    type: 'select',
    required: false,
    options: [
      { value: 'Serviceable', label: 'Serviceable' },
      { value: 'Unserviceable', label: 'Unserviceable' },
      { value: 'Under Repair', label: 'Under Repair' },
    ],
    gridCols: 1,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Explosives fields configuration
 */
export const explosiveFields: FieldConfig[] = [
  {
    name: 'explosive_id',
    label: 'Explosive ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., EXP-001',
    helpText: 'Unique identifier for this explosive item',
    gridCols: 1,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'TNT', label: 'TNT' },
      { value: 'C4', label: 'C4' },
      { value: 'Dynamite', label: 'Dynamite' },
      { value: 'Detonators', label: 'Detonators' },
      { value: 'Safety Fuse', label: 'Safety Fuse' },
      { value: 'Det Cord', label: 'Det Cord' },
    ],
    gridCols: 1,
  },
  {
    name: 'lot_number',
    label: 'Lot Number',
    type: 'text',
    required: true,
    gridCols: 1,
  },
  {
    name: 'quantity_received',
    label: 'Quantity Received',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'storage_location',
    label: 'Storage Location',
    type: 'text',
    required: true,
    gridCols: 1,
  },
  {
    name: 'authority',
    label: 'Authority',
    type: 'text',
    required: true,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Facilities fields configuration
 */
export const facilityFields: FieldConfig[] = [
  {
    name: 'facility_id',
    label: 'Facility ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., FAC-001',
    helpText: 'Unique identifier for this facility',
    gridCols: 1,
  },
  {
    name: 'facility_name',
    label: 'Facility Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Main Workshop',
    gridCols: 1,
  },
  {
    name: 'element',
    label: 'Element',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'quantity',
    label: 'Total Quantity',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'working',
    label: 'Working',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'not_working',
    label: 'Not Working',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Mechanics Tools fields configuration
 */
export const mechanicsToolFields: FieldConfig[] = [
  {
    name: 'tool_id',
    label: 'Tool ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., MECH-001',
    helpText: 'Unique identifier for this tool',
    gridCols: 1,
  },
  {
    name: 'tool_name',
    label: 'Tool Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Diagnostic Scanner',
    gridCols: 1,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Hand Tools', label: 'Hand Tools' },
      { value: 'Power Tools', label: 'Power Tools' },
      { value: 'Diagnostic Equipment', label: 'Diagnostic Equipment' },
      { value: 'Lifting Equipment', label: 'Lifting Equipment' },
      { value: 'Welding Equipment', label: 'Welding Equipment' },
      { value: 'Measuring Tools', label: 'Measuring Tools' },
      { value: 'Specialty Tools', label: 'Specialty Tools' },
    ],
    gridCols: 1,
  },
  {
    name: 'qty_on_hand',
    label: 'Quantity on Hand',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'serviceable',
    label: 'Serviceable',
    type: 'boolean',
    required: false,
    gridCols: 1,
  },
  {
    name: 'last_inspection_date',
    label: 'Last Inspection Date',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'next_inspection_due',
    label: 'Next Inspection Due',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'authority',
    label: 'Authority',
    type: 'text',
    required: false,
    placeholder: 'e.g., Issue voucher/order number',
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * MT Facilities fields configuration
 */
export const mtFacilityFields: FieldConfig[] = [
  {
    name: 'facility_id',
    label: 'Facility ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., MT-FAC-001',
    helpText: 'Unique identifier for this facility',
    gridCols: 1,
  },
  {
    name: 'facility_name',
    label: 'Facility Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Main Workshop',
    gridCols: 1,
  },
  {
    name: 'facility_type',
    label: 'Facility Type',
    type: 'select',
    required: true,
    options: [
      { value: 'Workshop', label: 'Workshop' },
      { value: 'Garage', label: 'Garage' },
      { value: 'Inspection Bay', label: 'Inspection Bay' },
      { value: 'Wash Bay', label: 'Wash Bay' },
      { value: 'Paint Shop', label: 'Paint Shop' },
      { value: 'Parts Store', label: 'Parts Store' },
      { value: 'Fuel Station', label: 'Fuel Station' },
      { value: 'Vehicle Park', label: 'Vehicle Park' },
    ],
    gridCols: 1,
  },
  {
    name: 'capacity',
    label: 'Capacity',
    type: 'number',
    required: false,
    placeholder: 'e.g., number of vehicles',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: false,
    options: [
      { value: 'Operational', label: 'Operational' },
      { value: 'Under Maintenance', label: 'Under Maintenance' },
      { value: 'Non-Operational', label: 'Non-Operational' },
      { value: 'Limited Use', label: 'Limited Use' },
    ],
    gridCols: 1,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    gridCols: 1,
  },
  {
    name: 'last_maintenance_date',
    label: 'Last Maintenance Date',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'next_maintenance_due',
    label: 'Next Maintenance Due',
    type: 'date',
    required: false,
    gridCols: 1,
  },
  {
    name: 'equipment_present',
    label: 'Equipment Present',
    type: 'textarea',
    required: false,
    placeholder: 'List major equipment/tools available',
    rows: 2,
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Works Materials fields configuration
 */
export const worksMaterialFields: FieldConfig[] = [
  {
    name: 'voucher_id',
    label: 'Voucher ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., VOUCHER-001',
    helpText: 'Unique identifier for this works material',
    gridCols: 1,
  },
  {
    name: 'material',
    label: 'Material',
    type: 'text',
    required: true,
    placeholder: 'e.g., Concrete, Steel',
    gridCols: 1,
  },
  {
    name: 'project_task',
    label: 'Project/Task',
    type: 'text',
    required: true,
    placeholder: 'e.g., Building Construction',
    gridCols: 1,
  },
  {
    name: 'quantity_received',
    label: 'Quantity Received',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'quantity_issued',
    label: 'Quantity Issued',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    helpText: 'Number of items currently issued',
    gridCols: 1,
    disabled: true, // Auto-calculated, not directly editable
  },
  {
    name: 'authority',
    label: 'Authority',
    type: 'text',
    required: false,
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Room Inventory fields configuration
 */
export const roomInventoryFields: FieldConfig[] = [
  {
    name: 'room_id',
    label: 'Room ID',
    type: 'text',
    required: true,
    placeholder: 'e.g., ROOM-101',
    helpText: 'Unique identifier for this room',
    gridCols: 1,
  },
  {
    name: 'platoon_company',
    label: 'Platoon/Company',
    type: 'text',
    required: false,
    placeholder: 'e.g., Alpha Company',
    gridCols: 1,
  },
  {
    name: 'room_type',
    label: 'Room Type',
    type: 'select',
    required: false,
    options: [
      { value: 'Barracks Room', label: 'Barracks Room' },
      { value: 'Office', label: 'Office' },
      { value: 'Store Room', label: 'Store Room' },
      { value: 'Common Room', label: 'Common Room' },
      { value: 'Other', label: 'Other' },
    ],
    gridCols: 1,
  },
  {
    name: 'occupants',
    label: 'Occupants',
    type: 'text',
    required: false,
    placeholder: 'Names of soldiers assigned to this room',
    gridCols: 1,
  },
  {
    name: 'inventory_item',
    label: 'Inventory Item',
    type: 'text',
    required: true,
    placeholder: 'e.g., Bed, Locker, Desk',
    gridCols: 2,
  },
  {
    name: 'expected_qty',
    label: 'Expected Quantity',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'present_qty',
    label: 'Present Quantity',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0,
    step: 1,
    gridCols: 1,
  },
  {
    name: 'inspection_date',
    label: 'Inspection Date',
    type: 'date',
    required: false,
    gridCols: 2,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes...',
    rows: 3,
    gridCols: 2,
  },
];

/**
 * Get field configuration for a module
 */
export function getFieldsForModule(module: string): FieldConfig[] {
  switch (module) {
    case 'tools':
      return toolFields;
    case 'uniforms':
      return uniformFields;
    case 'ppe':
      return ppeFields;
    case 'vehicles':
      return vehicleFields;
    case 'engineer_equipment':
      return engineerEquipmentFields;
    case 'general_inventory':
      return generalInventoryFields;
    case 'plant_machinery':
      return plantMachineryFields;
    case 'explosives':
      return explosiveFields;
    case 'facilities':
      return facilityFields;
    case 'mechanics_tools':
      return mechanicsToolFields;
    case 'mt_facilities':
      return mtFacilityFields;
    case 'works_materials':
      return worksMaterialFields;
    case 'room_inventory':
      return roomInventoryFields;
    default:
      return [];
  }
}

/**
 * Get default values for a module
 */
export function getDefaultValuesForModule(module: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    tools: {
      tool_id: '',
      tool_name: '',
      category: '',
      qty_on_hand: 0,
      serviceable: true,
      notes: '',
    },
    uniforms: {
      uniform_id: '',
      category: '',
      item_name: '',
      size: '',
      qty_on_hand: 0,
      qty_issued: 0,
      qty_returned: 0,
      serviceable: true,
      notes: '',
    },
    ppe: {
      ppe_id: '',
      item: '',
      category: '',
      qty_on_hand: 0,
      serviceable: true,
      notes: '',
    },
    vehicles: {
      vehicle_id: '',
      vehicle_type: '',
      make_model: '',
      registration_number: '',
      serial_number: '',
      serviceability: 'Serviceable',
      fuel_type: '',
      last_service_date: '',
      next_service_due: '',
      mileage: null,
      location: '',
      notes: '',
    },
    engineer_equipment: {
      equip_id: '',
      equipment_name: '',
      type: '',
      qty_on_hand: 0,
      serviceable: true,
      notes: '',
    },
    general_inventory: {
      item_id: '',
      item_name: '',
      category: '',
      qty_on_hand: 0,
      reorder_level: 0,
      notes: '',
    },
    plant_machinery: {
      plant_id: '',
      type: '',
      make_model: '',
      serial_number: '',
      serviceability: 'Serviceable',
      fuel_type: '',
      location: '',
      notes: '',
    },
    explosives: {
      explosive_id: '',
      type: '',
      lot_number: '',
      quantity_received: 0,
      storage_location: '',
      authority: '',
      notes: '',
    },
    facilities: {
      facility_id: '',
      facility_name: '',
      element: '',
      quantity: 0,
      working: 0,
      not_working: 0,
      notes: '',
    },
    mechanics_tools: {
      tool_id: '',
      tool_name: '',
      category: '',
      qty_on_hand: 0,
      serviceable: true,
      last_inspection_date: '',
      next_inspection_due: '',
      authority: '',
      notes: '',
    },
    mt_facilities: {
      facility_id: '',
      facility_name: '',
      facility_type: '',
      capacity: null,
      status: 'Operational',
      last_maintenance_date: '',
      next_maintenance_due: '',
      equipment_present: '',
      location: '',
      notes: '',
    },
    works_materials: {
      voucher_id: '',
      material: '',
      project_task: '',
      quantity_received: 0,
      quantity_issued: 0,
      authority: '',
      notes: '',
    },
    room_inventory: {
      room_id: '',
      platoon_company: '',
      room_type: '',
      occupants: '',
      inventory_item: '',
      expected_qty: 0,
      present_qty: 0,
      inspection_date: '',
      notes: '',
    },
  };

  return defaults[module] || {};
}

