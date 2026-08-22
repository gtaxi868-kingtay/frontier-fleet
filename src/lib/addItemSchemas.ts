import { z } from 'zod';

/**
 * Base validation schemas for Add Item dialogs
 * Each module has its own schema with module-specific fields
 */

// Common schemas - Note: Duplicate checking is done in the component via useDuplicateCheck hook
// Schema validation happens before async check
const idSchema = (fieldName: string) =>
  z.string()
    .min(1, `${fieldName} is required`)
    .trim();

const optionalStringSchema = z.string().optional().nullable();

// Tool Schema
export const toolSchema = (unitId?: string | null) =>
  z.object({
    tool_id: idSchema('Tool ID'),
    tool_name: z.string().min(1, 'Tool name is required'),
    category: z.enum(
      ['Hand Tools', 'Power Tools', 'Measuring Tools', 'Cutting Tools', 'Specialist Tools'],
      { errorMap: () => ({ message: 'Please select a valid category' }) }
    ),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    serviceable: z.boolean().default(true),
    notes: optionalStringSchema,
  });

// Uniform Schema
export const uniformSchema = (unitId?: string | null) =>
  z.object({
    uniform_id: idSchema('Uniform ID'),
    category: z.enum(
      ['Headwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories', 'Complete Sets'],
      { errorMap: () => ({ message: 'Please select a valid category' }) }
    ),
    item_name: z.string().min(1, 'Item name is required'),
    size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A']).optional().nullable(),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    qty_issued: z.coerce.number().min(0, 'Quantity issued must be 0 or greater').default(0).optional(),
    qty_returned: z.coerce.number().min(0, 'Quantity returned must be 0 or greater').default(0).optional(),
    serviceable: z.boolean().default(true),
    notes: optionalStringSchema,
  });

// PPE Schema
export const ppeSchema = (unitId?: string | null) =>
  z.object({
    ppe_id: idSchema('PPE ID'),
    item: z.string().min(1, 'Item name is required'),
    category: z.enum(
      [
        'Head Protection',
        'Eye Protection',
        'Hearing Protection',
        'Body Protection',
        'Hand Protection',
        'Foot Protection',
        'Respiratory Protection',
      ],
      { errorMap: () => ({ message: 'Please select a valid category' }) }
    ),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    serviceable: z.boolean().default(true),
    notes: optionalStringSchema,
  });

// Vehicle Schema
export const vehicleSchema = (unitId?: string | null) =>
  z.object({
    vehicle_id: idSchema('Vehicle ID'),
    vehicle_type: z.string().min(1, 'Vehicle type is required'),
    make_model: z.string().optional().nullable(),
    registration_number: z.string().optional().nullable(),
    serial_number: z.string().optional().nullable(),
    serviceability: z.enum(['Serviceable', 'Unserviceable', 'Under Repair', 'Awaiting Parts']).default('Serviceable'),
    fuel_type: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']).optional().nullable(),
    last_service_date: z.string().optional().nullable(),
    next_service_due: z.string().optional().nullable(),
    mileage: z.coerce.number().min(0).optional().nullable(),
    location: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// Engineer Equipment Schema
export const engineerEquipmentSchema = (unitId?: string | null) =>
  z.object({
    equip_id: idSchema('Equipment ID'),
    equipment_name: z.string().min(1, 'Equipment name is required'),
    type: z.enum(
      [
        'Bridging Equipment',
        'Construction Equipment',
        'Demolition Equipment',
        'Surveying Equipment',
        'Water Supply Equipment',
        'Other',
      ],
      { errorMap: () => ({ message: 'Please select a valid type' }) }
    ),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    serviceable: z.boolean().default(true),
    notes: optionalStringSchema,
  });

// General Inventory Schema
export const generalInventorySchema = (unitId?: string | null) =>
  z.object({
    item_id: idSchema('Item ID'),
    item_name: z.string().min(1, 'Item name is required'),
    category: z.string().min(1, 'Category is required'),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    reorder_level: z.coerce.number().min(0, 'Reorder level must be 0 or greater').default(0),
    notes: optionalStringSchema,
  });

// Plant Machinery Schema
export const plantMachinerySchema = (unitId?: string | null) =>
  z.object({
    plant_id: idSchema('Plant ID'),
    type: z.enum(
      ['Excavator', 'Bulldozer', 'Grader', 'Loader', 'Compactor', 'Crane', 'Generator'],
      { errorMap: () => ({ message: 'Please select a valid type' }) }
    ),
    make_model: z.string().optional().nullable(),
    serial_number: z.string().optional().nullable(),
    serviceability: z.enum(['Serviceable', 'Unserviceable', 'Under Repair']).default('Serviceable'),
    fuel_type: z.union([z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']), z.literal('')]).optional(),
    location: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// Explosives Schema
export const explosiveSchema = (unitId?: string | null) =>
  z.object({
    explosive_id: idSchema('Explosive ID'),
    type: z.enum(
      ['TNT', 'C4', 'Dynamite', 'Detonators', 'Safety Fuse', 'Det Cord'],
      { errorMap: () => ({ message: 'Please select a valid type' }) }
    ),
    lot_number: z.string().min(1, 'Lot number is required'),
    quantity_received: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    storage_location: z.string().min(1, 'Storage location is required'),
    authority: z.string().min(1, 'Authority is required'),
    notes: optionalStringSchema,
  });

// Facilities Schema
export const facilitySchema = (unitId?: string | null) =>
  z.object({
    facility_id: idSchema('Facility ID'),
    facility_name: z.string().min(1, 'Facility name is required'),
    element: z.string().optional().nullable(),
    quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    working: z.coerce.number().min(0, 'Working count must be 0 or greater').default(0),
    not_working: z.coerce.number().min(0, 'Not working count must be 0 or greater').default(0),
    notes: optionalStringSchema,
  });

// Mechanics Tools Schema
export const mechanicsToolSchema = (unitId?: string | null) =>
  z.object({
    tool_id: idSchema('Tool ID'),
    tool_name: z.string().min(1, 'Tool name is required'),
    category: z.enum(
      [
        'Hand Tools',
        'Power Tools',
        'Diagnostic Equipment',
        'Lifting Equipment',
        'Welding Equipment',
        'Measuring Tools',
        'Specialty Tools',
      ],
      { errorMap: () => ({ message: 'Please select a valid category' }) }
    ),
    qty_on_hand: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    serviceable: z.boolean().default(true),
    last_inspection_date: z.string().optional().nullable(),
    next_inspection_due: z.string().optional().nullable(),
    authority: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// MT Facilities Schema
export const mtFacilitySchema = (unitId?: string | null) =>
  z.object({
    facility_id: idSchema('Facility ID'),
    facility_name: z.string().min(1, 'Facility name is required'),
    facility_type: z.enum(
      [
        'Workshop',
        'Garage',
        'Inspection Bay',
        'Wash Bay',
        'Paint Shop',
        'Parts Store',
        'Fuel Station',
        'Vehicle Park',
      ],
      { errorMap: () => ({ message: 'Please select a valid facility type' }) }
    ),
    capacity: z.coerce.number().min(0).optional().nullable(),
    status: z.enum(['Operational', 'Under Maintenance', 'Non-Operational', 'Limited Use']).default('Operational'),
    last_maintenance_date: z.string().optional().nullable(),
    next_maintenance_due: z.string().optional().nullable(),
    equipment_present: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// Works Materials Schema
export const worksMaterialSchema = (unitId?: string | null) =>
  z.object({
    voucher_id: idSchema('Voucher ID'),
    material: z.string().min(1, 'Material is required'),
    project_task: z.string().min(1, 'Project/Task is required'),
    quantity_received: z.coerce.number().min(0, 'Quantity must be 0 or greater').default(0),
    quantity_issued: z.coerce.number().min(0, 'Quantity issued must be 0 or greater').default(0).optional(),
    authority: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// Room Inventory Schema
export const roomInventorySchema = (unitId?: string | null) =>
  z.object({
    room_id: idSchema('Room ID'),
    platoon_company: z.string().optional().nullable(),
    room_type: z.union([
      z.enum(['Barracks Room', 'Office', 'Store Room', 'Common Room', 'Other']),
      z.literal(''),
    ]).optional().nullable(),
    occupants: z.string().optional().nullable(),
    inventory_item: z.string().min(1, 'Inventory item is required'),
    expected_qty: z.coerce.number().min(0, 'Expected quantity must be 0 or greater').default(0),
    present_qty: z.coerce.number().min(0, 'Present quantity must be 0 or greater').default(0),
    inspection_date: z.string().optional().nullable(),
    notes: optionalStringSchema,
  });

// Helper to get schema by module name
export function getSchemaForModule(
  module: string,
  unitId?: string | null
): z.ZodObject<any> {
  switch (module) {
    case 'tools':
      return toolSchema(unitId);
    case 'uniforms':
      return uniformSchema(unitId);
    case 'ppe':
      return ppeSchema(unitId);
    case 'vehicles':
      return vehicleSchema(unitId);
    case 'engineer_equipment':
      return engineerEquipmentSchema(unitId);
    case 'general_inventory':
      return generalInventorySchema(unitId);
    case 'plant_machinery':
      return plantMachinerySchema(unitId);
    case 'explosives':
      return explosiveSchema(unitId);
    case 'facilities':
      return facilitySchema(unitId);
    case 'mechanics_tools':
      return mechanicsToolSchema(unitId);
    case 'mt_facilities':
      return mtFacilitySchema(unitId);
    case 'works_materials':
      return worksMaterialSchema(unitId);
    case 'room_inventory':
      return roomInventorySchema(unitId);
    default:
      throw new Error(`No schema defined for module: ${module}`);
  }
}

// Type exports for form data
export type ToolFormData = z.infer<ReturnType<typeof toolSchema>>;
export type UniformFormData = z.infer<ReturnType<typeof uniformSchema>>;
export type PPEFormData = z.infer<ReturnType<typeof ppeSchema>>;
export type VehicleFormData = z.infer<ReturnType<typeof vehicleSchema>>;
export type EngineerEquipmentFormData = z.infer<ReturnType<typeof engineerEquipmentSchema>>;
export type GeneralInventoryFormData = z.infer<ReturnType<typeof generalInventorySchema>>;
export type PlantMachineryFormData = z.infer<ReturnType<typeof plantMachinerySchema>>;
export type ExplosiveFormData = z.infer<ReturnType<typeof explosiveSchema>>;
export type FacilityFormData = z.infer<ReturnType<typeof facilitySchema>>;
export type MechanicsToolFormData = z.infer<ReturnType<typeof mechanicsToolSchema>>;
export type MTFacilityFormData = z.infer<ReturnType<typeof mtFacilitySchema>>;
export type WorksMaterialFormData = z.infer<ReturnType<typeof worksMaterialSchema>>;

