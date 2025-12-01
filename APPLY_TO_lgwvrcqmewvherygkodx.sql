-- COMPLETE IBIMS SCHEMA FOR PROJECT: lgwvrcqmewvherygkodx
-- Apply this migration to your Supabase project

-- Step 1: Create enums
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('CO', 'S4', 'OC', 'SQMS', 'Soldier');
CREATE TYPE IF NOT EXISTS public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Step 2: Create base tables
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  status public.approval_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rank TEXT,
  unit_id UUID REFERENCES public.units(id),
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT,
  unit_id UUID REFERENCES public.units(id),
  status TEXT DEFAULT 'Available',
  condition TEXT DEFAULT 'Good',
  assigned_to UUID REFERENCES auth.users(id),
  issued_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  issued_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),
  issue_date TIMESTAMPTZ DEFAULT now(),
  return_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Issued',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id),
  created_by UUID REFERENCES auth.users(id),
  created_for UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  summary TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  sender_role public.app_role,
  recipient_role public.app_role,
  unit_id UUID REFERENCES public.units(id),
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Create inventory module tables
CREATE TABLE IF NOT EXISTS public.facilities (
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

CREATE TABLE IF NOT EXISTS public.tools (
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

CREATE TABLE IF NOT EXISTS public.engineer_equipment (
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

CREATE TABLE IF NOT EXISTS public.weapons (
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

CREATE TABLE IF NOT EXISTS public.general_inventory (
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

CREATE TABLE IF NOT EXISTS public.uniforms (
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

CREATE TABLE IF NOT EXISTS public.works_materials (
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

CREATE TABLE IF NOT EXISTS public.plant_machinery (
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

CREATE TABLE IF NOT EXISTS public.explosives (
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

CREATE TABLE IF NOT EXISTS public.ppe (
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

CREATE TABLE IF NOT EXISTS public.room_inventory (
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

CREATE TABLE IF NOT EXISTS public.mechanics_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id text UNIQUE NOT NULL,
  tool_name text NOT NULL,
  category text NOT NULL,
  qty_on_hand integer DEFAULT 0,
  qty_issued integer DEFAULT 0,
  issued_to uuid REFERENCES public.profiles(id),
  issue_date date,
  return_date date,
  serviceable boolean DEFAULT true,
  last_inspection_date date,
  next_inspection_due date,
  squadron_id uuid REFERENCES public.units(id),
  condition_issue text,
  condition_return text,
  authority text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mt_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id text UNIQUE NOT NULL,
  facility_name text NOT NULL,
  facility_type text NOT NULL,
  capacity integer,
  status text DEFAULT 'Operational',
  last_maintenance_date date,
  next_maintenance_due date,
  equipment_present text,
  location text,
  squadron_id uuid REFERENCES public.units(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id),
  plate_number text,
  model text,
  color text,
  insurance_expiry date,
  created_at timestamptz DEFAULT now()
);

-- Step 4: Enable RLS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.mechanics_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rank', 'Recruit')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 6: Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at triggers for all inventory tables
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

CREATE TRIGGER update_mechanics_tools_updated_at BEFORE UPDATE ON public.mechanics_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mt_facilities_updated_at BEFORE UPDATE ON public.mt_facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Insert sample units
INSERT INTO public.units (name, location) VALUES
  ('Support Squadron', 'Teteron Barracks'),
  ('EME Squadron', 'Teteron Barracks'),
  ('Resource Troop', 'Teteron Barracks'),
  ('Field Squadron', 'Chaguaramas'),
  ('Construction Squadron', 'Teteron Barracks')
ON CONFLICT DO NOTHING;

-- Step 8: Basic RLS policies (simplified - can add more detailed ones later)
-- Note: This is a simplified version. Full RLS policies from migrations should be added separately.

