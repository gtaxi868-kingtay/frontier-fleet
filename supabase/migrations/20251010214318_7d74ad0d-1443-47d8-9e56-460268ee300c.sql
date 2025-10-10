-- Create vehicles table for Motor Transport department
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id text NOT NULL,
  vehicle_type text NOT NULL,
  make_model text,
  registration_number text,
  serial_number text,
  serviceability text DEFAULT 'Serviceable',
  assigned_to uuid,
  fuel_type text,
  last_service_date date,
  next_service_due date,
  mileage integer DEFAULT 0,
  location text,
  squadron_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create mechanics_tools table
CREATE TABLE public.mechanics_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id text NOT NULL,
  tool_name text NOT NULL,
  category text NOT NULL,
  qty_on_hand integer DEFAULT 0,
  qty_issued integer DEFAULT 0,
  issued_to uuid,
  issue_date date,
  return_date date,
  serviceable boolean DEFAULT true,
  last_inspection_date date,
  next_inspection_due date,
  squadron_id uuid,
  condition_issue text,
  condition_return text,
  authority text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create mt_facilities table
CREATE TABLE public.mt_facilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  facility_type text NOT NULL,
  capacity integer,
  status text DEFAULT 'Operational',
  last_maintenance_date date,
  next_maintenance_due date,
  equipment_present text,
  location text,
  squadron_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all three tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_facilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicles
CREATE POLICY "All authenticated users can view vehicles"
  ON public.vehicles FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage vehicles"
  ON public.vehicles FOR ALL
  USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role));

-- RLS Policies for mechanics_tools
CREATE POLICY "All authenticated users can view mechanics tools"
  ON public.mechanics_tools FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage mechanics tools"
  ON public.mechanics_tools FOR ALL
  USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role));

-- RLS Policies for mt_facilities
CREATE POLICY "All authenticated users can view MT facilities"
  ON public.mt_facilities FOR SELECT
  USING (true);

CREATE POLICY "S4 and SQMS can manage MT facilities"
  ON public.mt_facilities FOR ALL
  USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mechanics_tools_updated_at
  BEFORE UPDATE ON public.mechanics_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mt_facilities_updated_at
  BEFORE UPDATE ON public.mt_facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();