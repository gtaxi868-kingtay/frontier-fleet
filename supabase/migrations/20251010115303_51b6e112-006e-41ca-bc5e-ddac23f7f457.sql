-- Create comprehensive tracking system tables based on QM Master System

-- 1. FACILITIES TABLE
CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id text UNIQUE NOT NULL,
  facility_name text NOT NULL,
  element text,
  squadron_id uuid REFERENCES public.units(id),
  quantity integer DEFAULT 0,
  working integer DEFAULT 0,
  not_working integer DEFAULT 0,
  last_inspection date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TOOLS TABLE
CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id text UNIQUE NOT NULL,
  tool_name text NOT NULL,
  category text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  qty_on_hand integer DEFAULT 0,
  qty_issued integer DEFAULT 0,
  qty_returned integer DEFAULT 0,
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  condition_issue text,
  condition_return text,
  serviceable boolean DEFAULT true,
  last_inspection_date date,
  next_inspection_due date,
  authority text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. ENGINEER EQUIPMENT TABLE
CREATE TABLE public.engineer_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equip_id text UNIQUE NOT NULL,
  equipment_name text NOT NULL,
  type text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  qty_on_hand integer DEFAULT 0,
  qty_issued integer DEFAULT 0,
  qty_returned integer DEFAULT 0,
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  condition_issue text,
  condition_return text,
  serviceable boolean DEFAULT true,
  last_inspection_date date,
  next_inspection_due date,
  authority text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. WEAPONS TABLE (enhanced from inventory_items)
CREATE TABLE public.weapons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weapon_id text UNIQUE NOT NULL,
  weapon_type text NOT NULL,
  serial_number text UNIQUE,
  squadron_id uuid REFERENCES public.units(id),
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  condition_issue text,
  serviceable boolean DEFAULT true,
  last_inspection_date date,
  next_inspection_due date,
  survey_report_filed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. INVENTORY (General Items with reorder levels)
CREATE TABLE public.general_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text UNIQUE NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  qty_on_hand integer DEFAULT 0,
  qty_issued_monthly integer DEFAULT 0,
  qty_returned_monthly integer DEFAULT 0,
  reorder_level integer DEFAULT 0,
  last_stock_check date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. UNIFORMS TABLE
CREATE TABLE public.uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uniform_id text UNIQUE NOT NULL,
  item_name text NOT NULL,
  size text,
  squadron_id uuid REFERENCES public.units(id),
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  condition_issue text,
  condition_return text,
  serviceable boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. WORKS MATERIALS TABLE
CREATE TABLE public.works_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id text UNIQUE NOT NULL,
  project_task text NOT NULL,
  material text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  quantity_received integer DEFAULT 0,
  quantity_issued integer DEFAULT 0,
  authority text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. PLANT AND MACHINERY TABLE
CREATE TABLE public.plant_machinery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id text UNIQUE NOT NULL,
  type text NOT NULL,
  make_model text,
  serial_number text UNIQUE,
  squadron_id uuid REFERENCES public.units(id),
  location text,
  operator_assigned uuid REFERENCES public.profiles(id),
  serviceability text,
  last_service_date date,
  service_interval_days integer DEFAULT 90,
  next_service_due date,
  fuel_type text,
  fuel_used_monthly numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. EXPLOSIVES TABLE
CREATE TABLE public.explosives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  explosive_id text UNIQUE NOT NULL,
  type text NOT NULL,
  lot_number text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  quantity_received integer DEFAULT 0,
  quantity_issued integer DEFAULT 0,
  quantity_returned integer DEFAULT 0,
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  storage_location text NOT NULL,
  authority text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. PPE (Personal Protective Equipment) TABLE
CREATE TABLE public.ppe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ppe_id text UNIQUE NOT NULL,
  item text NOT NULL,
  category text NOT NULL,
  squadron_id uuid REFERENCES public.units(id),
  qty_on_hand integer DEFAULT 0,
  qty_issued integer DEFAULT 0,
  qty_returned integer DEFAULT 0,
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  condition_issue text,
  condition_return text,
  serviceable boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. ROOM INVENTORY TABLE
CREATE TABLE public.room_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text UNIQUE NOT NULL,
  platoon_company text,
  room_type text,
  squadron_id uuid REFERENCES public.units(id),
  occupants text,
  inventory_item text NOT NULL,
  expected_qty integer DEFAULT 0,
  present_qty integer DEFAULT 0,
  inspection_date date,
  inspector uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uniforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explosives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR FACILITIES
CREATE POLICY "All authenticated users can view facilities"
  ON public.facilities FOR SELECT
  USING (true);

CREATE POLICY "CO and S4 can manage facilities"
  ON public.facilities FOR ALL
  USING (has_role(auth.uid(), 'CO') OR has_role(auth.uid(), 'S4'));

-- RLS POLICIES FOR TOOLS
CREATE POLICY "All authenticated users can view tools"
  ON public.tools FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage tools"
  ON public.tools FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR ENGINEER EQUIPMENT
CREATE POLICY "All authenticated users can view engineer equipment"
  ON public.engineer_equipment FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage engineer equipment"
  ON public.engineer_equipment FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR WEAPONS
CREATE POLICY "All authenticated users can view weapons"
  ON public.weapons FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage weapons"
  ON public.weapons FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR GENERAL INVENTORY
CREATE POLICY "All authenticated users can view general inventory"
  ON public.general_inventory FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage general inventory"
  ON public.general_inventory FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR UNIFORMS
CREATE POLICY "All authenticated users can view uniforms"
  ON public.uniforms FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage uniforms"
  ON public.uniforms FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR WORKS MATERIALS
CREATE POLICY "All authenticated users can view works materials"
  ON public.works_materials FOR SELECT
  USING (true);

CREATE POLICY "S4, OC, and SQMS can manage works materials"
  ON public.works_materials FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'OC') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR PLANT AND MACHINERY
CREATE POLICY "All authenticated users can view plant machinery"
  ON public.plant_machinery FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage plant machinery"
  ON public.plant_machinery FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR EXPLOSIVES (Most restrictive)
CREATE POLICY "All authenticated users can view explosives"
  ON public.explosives FOR SELECT
  USING (true);

CREATE POLICY "Only S4 can manage explosives"
  ON public.explosives FOR ALL
  USING (has_role(auth.uid(), 'S4'));

-- RLS POLICIES FOR PPE
CREATE POLICY "All authenticated users can view PPE"
  ON public.ppe FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage PPE"
  ON public.ppe FOR ALL
  USING (has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- RLS POLICIES FOR ROOM INVENTORY
CREATE POLICY "All authenticated users can view room inventory"
  ON public.room_inventory FOR SELECT
  USING (true);

CREATE POLICY "OC, S4, and SQMS can manage room inventory"
  ON public.room_inventory FOR ALL
  USING (has_role(auth.uid(), 'OC') OR has_role(auth.uid(), 'S4') OR has_role(auth.uid(), 'SQMS'));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engineer_equipment_updated_at BEFORE UPDATE ON public.engineer_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weapons_updated_at BEFORE UPDATE ON public.weapons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_general_inventory_updated_at BEFORE UPDATE ON public.general_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_uniforms_updated_at BEFORE UPDATE ON public.uniforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_works_materials_updated_at BEFORE UPDATE ON public.works_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plant_machinery_updated_at BEFORE UPDATE ON public.plant_machinery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_explosives_updated_at BEFORE UPDATE ON public.explosives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ppe_updated_at BEFORE UPDATE ON public.ppe
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_inventory_updated_at BEFORE UPDATE ON public.room_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();