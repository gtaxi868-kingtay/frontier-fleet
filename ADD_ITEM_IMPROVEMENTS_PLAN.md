# Add Item Dialogs - Improvement Plan

## Problem
Current Add Item dialogs (AddToolDialog, AddUniformDialog, etc.) are basic forms with minimal validation and no duplicate checking. Users can make mistakes easily.

---

## Solution: Standardized, Smart Add Item System

### 1. Create Base Add Item Component

**File:** `src/components/BaseAddItemDialog.tsx` (NEW)

**Features:**
- Uses react-hook-form + zod for validation
- Real-time duplicate ID checking
- Field-level error messages
- Auto-suggestions for IDs
- Smart defaults
- Loading states
- Error handling using new error system

**Props:**
- `module`: Which inventory module
- `schema`: Zod validation schema
- `fields`: Field definitions (auto-generate form)
- `defaultValues`: Smart defaults
- `onSuccess`: Callback

### 2. Create Validation Schemas

**File:** `src/lib/addItemSchemas.ts` (NEW)

**Contains:**
- Zod schemas for each module
- Field definitions
- Validation rules
- Custom error messages

**Example:**
```typescript
export const toolSchema = z.object({
  tool_id: z.string().min(1, "Tool ID required")
    .refine(async (id) => {
      // Check for duplicates
    }, "This ID already exists"),
  tool_name: z.string().min(1, "Tool name required"),
  category: z.enum([...], "Select valid category"),
  qty_on_hand: z.number().min(0, "Must be positive"),
});
```

### 3. Create Duplicate Checker Hook

**File:** `src/hooks/useDuplicateCheck.ts` (NEW)

**Features:**
- Checks if ID exists in database
- Real-time validation
- Suggests next available ID
- Caches results

### 4. Create Field Configuration System

**File:** `src/lib/addItemFields.ts` (NEW)

**Features:**
- Field definitions for each module
- Type (text, number, select, date)
- Placeholders, help text
- Options for dropdowns
- Conditional fields

### 5. Update All Add Dialogs

**Replace:**
- AddToolDialog.tsx
- AddUniformDialog.tsx
- AddPPEDialog.tsx
- AddVehicleDialog.tsx
- AddEngineerEquipmentDialog.tsx
- etc.

**With:** BaseAddItemDialog using module-specific config

---

## Improvements Made

### Before:
- Basic HTML forms
- No duplicate checking
- Generic errors
- Manual typing everything

### After:
- Standardized forms
- Real-time duplicate checking
- Specific error messages
- Auto-suggestions & templates
- Guided workflow
- Smart defaults

---

## Implementation Priority

**High Priority:**
1. Create BaseAddItemDialog component
2. Add duplicate checking hook
3. Create validation schemas
4. Update 3-4 most used dialogs (Tools, Uniforms, Weapons)

**Medium Priority:**
5. Update remaining dialogs
6. Add auto-suggestions
7. Add templates feature

---

**Result:** Much faster, safer, more user-friendly item entry
