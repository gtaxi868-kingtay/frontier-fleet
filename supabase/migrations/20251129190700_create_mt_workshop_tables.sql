-- Phase 1.3: MT & Workshop Specific Tables

-- ============================================================================
-- MT WORK TICKETS TABLE (Vehicle assignments, journeys, drivers, routes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_work_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id),
  driver_id uuid REFERENCES public.profiles(id),
  issued_by_id uuid REFERENCES public.profiles(id), -- MTO, MT Sgt, or appointed officer
  journey_purpose text NOT NULL,
  destination text NOT NULL,
  route text,
  load_description text,
  passenger_count integer DEFAULT 0,
  authorized_by text, -- MTO, MT Sgt, etc.
  issue_date date NOT NULL,
  issue_time time,
  return_date date,
  return_time time,
  mileage_start integer,
  mileage_end integer,
  mileage_total integer,
  petrol_issued decimal(10,2), -- Litres
  oil_issued decimal(10,2), -- Litres
  condition_on_issue text,
  condition_on_return text,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MT DRIVER PERMITS TABLE (Military Driving Permits tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_driver_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_number text UNIQUE NOT NULL,
  driver_id uuid REFERENCES public.profiles(id) NOT NULL,
  vehicle_classes text[] NOT NULL, -- Array of vehicle classes (Car, Land Rover SWB, etc.)
  issued_by_id uuid REFERENCES public.profiles(id), -- MTO
  issued_date date NOT NULL,
  expiry_date date NOT NULL, -- Annual renewal on Jan 1
  withdrawn_date date,
  withdrawal_reason text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'expired', 'provisional')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MT DRIVER TESTS TABLE (Driving test records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_driver_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) NOT NULL,
  vehicle_class text NOT NULL,
  test_date date NOT NULL,
  examiner_name text NOT NULL,
  examiner_role text, -- MTO, Transport Commissioner, etc.
  test_type text NOT NULL CHECK (test_type IN ('driving_cadre', 'civil_license', 'additional_class', 'emergency')),
  test_result text NOT NULL CHECK (test_result IN ('passed', 'failed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MT VEHICLE ALLOCATIONS TABLE (Permanent vehicle assignments to officers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_vehicle_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) NOT NULL,
  allocated_to_id uuid REFERENCES public.profiles(id) NOT NULL, -- Officer profile
  allocation_type text NOT NULL CHECK (allocation_type IN ('CO', '2IC', 'Rifle_Coy_Commander', 'Signals_Officer', 'RP', 'QM', 'RSM', 'Dir_of_Mus')),
  allocated_from date NOT NULL,
  allocated_until date, -- NULL if permanent
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_id, allocated_to_id)
);

-- ============================================================================
-- MT ACCIDENTS TABLE (Accident reports, TTR Form)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_accidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_number text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id),
  driver_id uuid REFERENCES public.profiles(id),
  accident_date date NOT NULL,
  accident_time time,
  location text NOT NULL,
  accident_type text CHECK (accident_type IN ('collision', 'single_vehicle', 'pedestrian', 'property_damage', 'other')),
  weather_conditions text,
  road_conditions text,
  speed_limit integer,
  vehicle_speed integer,
  passengers_injured integer DEFAULT 0,
  pedestrians_injured integer DEFAULT 0,
  property_damage_description text,
  vehicle_damage_description text,
  police_report_number text,
  police_station text,
  sketch_url text, -- URL to accident sketch
  estimated_repair_cost decimal(10,2),
  liability text CHECK (liability IN ('at_fault', 'not_at_fault', 'unknown', 'pending')),
  driver_statement text,
  witness_statements text[],
  reported_to_police boolean DEFAULT false,
  police_report_filed boolean DEFAULT false,
  reported_to_mto boolean DEFAULT false,
  reported_to_orderly_officer boolean DEFAULT false,
  mto_report_submitted boolean DEFAULT false,
  comptroller_report_submitted boolean DEFAULT false,
  comptroller_report_date date,
  driver_permit_withdrawn boolean DEFAULT false,
  withdrawal_duration_months integer, -- Minimum 3 months
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- VEHICLE INSPECTIONS TABLE (Daily, monthly, technical inspections - TTR Forms 16, 17)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) NOT NULL,
  inspection_type text NOT NULL CHECK (inspection_type IN ('daily', 'monthly', 'technical')),
  inspection_date date NOT NULL,
  inspected_by_id uuid REFERENCES public.profiles(id), -- Driver for daily, MT NCO for monthly, Workshop for technical
  inspector_name text, -- If not a system user
  inspector_role text,
  form_type text CHECK (form_type IN ('TTR_16', 'TTR_17')), -- TTR Form 16 (Monthly) or TTR 17 (Technical)
  
  -- Technical Inspection Fields (TTR Form 17)
  engine_condition text,
  transmission_condition text,
  brakes_condition text,
  steering_condition text,
  suspension_condition text,
  electrical_condition text,
  body_condition text,
  tires_condition text,
  lights_condition text,
  
  -- General Fields
  defects_found text[],
  defects_corrected text[],
  defects_pending text[],
  serviceability_status text CHECK (serviceability_status IN ('serviceable', 'unserviceable', 'restricted')),
  driver_servicing_efficiency text, -- For monthly checks
  recommendation text,
  next_inspection_due date,
  forwarded_to_co boolean DEFAULT false,
  co_viewed_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MT DETAIL SHEETS TABLE (Daily MT detail/duty rosters)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mt_detail_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detail_date date NOT NULL,
  issued_by_id uuid REFERENCES public.profiles(id), -- MTO
  mt_sergeant text,
  mt_stores_sergeant text,
  mt_clerk text,
  pol_storeman text,
  night_duty_nco text,
  duty_driver text,
  detail_notes text,
  copies_to_adjutant integer DEFAULT 2, -- Two copies forwarded to Adjutant
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(detail_date)
);

-- ============================================================================
-- POL ACCOUNTS TABLE (TTR Form 14 - Petrol, Oil, Lubricants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pol_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_period_month date NOT NULL, -- Year-month for monthly account
  vehicle_id uuid REFERENCES public.vehicles(id),
  work_ticket_id uuid REFERENCES public.mt_work_tickets(id),
  petrol_issued decimal(10,2) NOT NULL DEFAULT 0, -- Litres
  oil_issued decimal(10,2) NOT NULL DEFAULT 0, -- Litres
  lubricant_issued decimal(10,2) NOT NULL DEFAULT 0, -- Litres
  mileage_start integer,
  mileage_end integer,
  mileage_total integer,
  mpg_calculated decimal(10,2), -- Miles per gallon or km per litre
  issued_by_id uuid REFERENCES public.profiles(id), -- POL Storeman
  issued_date date NOT NULL,
  submitted_to_mto boolean DEFAULT false,
  submitted_to_co boolean DEFAULT false,
  submitted_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- POL STORAGE TABLE (POL storage location and security tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pol_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_location text NOT NULL,
  storage_type text CHECK (storage_type IN ('main_tank', 'jerrican', 'reserve')),
  fuel_type text CHECK (fuel_type IN ('petrol', 'diesel', 'oil', 'lubricant')),
  capacity decimal(10,2), -- Litres
  current_level decimal(10,2), -- Litres
  unit text DEFAULT 'litres',
  last_refilled_date date,
  last_inspection_date date,
  security_status text DEFAULT 'secure' CHECK (security_status IN ('secure', 'check_required')),
  fire_point_equipped boolean DEFAULT false,
  fire_extinguishers_count integer DEFAULT 0,
  sand_buckets_count integer DEFAULT 0,
  fire_alarm_installed boolean DEFAULT false,
  no_smoking_signs_posted boolean DEFAULT false,
  access_controlled boolean DEFAULT true,
  key_holder_id uuid REFERENCES public.profiles(id), -- POL Storeman or Duty MT NCO after hours
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- JERRICAN INVENTORY TABLE (Reserve petrol tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jerrican_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jerrican_number text UNIQUE NOT NULL,
  vehicle_assigned uuid REFERENCES public.vehicles(id), -- 2 jerricans per 4-wheeled vehicle
  battalion_reserve boolean DEFAULT false, -- 100 jerricans for Bn reserve
  fuel_type text DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel')),
  capacity decimal(10,2) DEFAULT 20.0, -- Standard 20 litre jerrican
  current_level decimal(10,2),
  last_checked_date date,
  condition text CHECK (condition IN ('good', 'needs_repair', 'condemned')),
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WORKSHOP INSPECTIONS TABLE (Bimonthly inspections, equipment status)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number text UNIQUE NOT NULL,
  inspection_date date NOT NULL,
  inspected_by_id uuid REFERENCES public.profiles(id), -- Wksp WO
  equipment_type text NOT NULL, -- 'vehicle', 'plant_machinery', 'mechanics_tools', 'general'
  equipment_id uuid, -- Reference to vehicles, plant_machinery, mechanics_tools
  equipment_reference text, -- Vehicle ID, tool ID, etc.
  equipment_name text,
  unit_id uuid REFERENCES public.units(id), -- Unit equipment belongs to
  inspection_status text NOT NULL CHECK (inspection_status IN ('serviceable', 'needs_repair', 'beyond_capacity', 'unserviceable')),
  defects_found text[],
  repair_required text,
  estimated_repair_cost decimal(10,2),
  repair_capacity text CHECK (repair_capacity IN ('workshop_capacity', 'beyond_capacity', 'civilian_firm_required')),
  report_submitted_to_mto boolean DEFAULT false,
  report_submitted_date date,
  next_inspection_due date, -- Bimonthly = 2 months from inspection date
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WORKSHOP REPAIRS TABLE (Repair tracking, capacity limits, civilian firm referrals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_number text UNIQUE NOT NULL,
  equipment_type text NOT NULL,
  equipment_id uuid,
  equipment_reference text,
  reported_by_id uuid REFERENCES public.profiles(id),
  repair_requested_date date NOT NULL,
  repair_started_date date,
  repair_completed_date date,
  repaired_by_id uuid REFERENCES public.profiles(id), -- Wksp WO or workshop personnel
  repair_type text CHECK (repair_type IN ('workshop_repair', 'civilian_firm', 'pioneer_section')),
  repair_status text DEFAULT 'pending' CHECK (repair_status IN ('pending', 'in_progress', 'completed', 'referred_to_civilian', 'beyond_capacity', 'condemned')),
  repair_description text NOT NULL,
  parts_required text[],
  parts_cost decimal(10,2),
  labor_cost decimal(10,2),
  total_cost decimal(10,2),
  civilian_firm_name text,
  civilian_firm_contact text,
  co_estimated_cost_approved boolean DEFAULT false,
  co_funds_confirmed boolean DEFAULT false,
  work_order_number text,
  completion_certificate_url text,
  quality_check_passed boolean DEFAULT false,
  quality_checked_by_id uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WORKSHOP REPORTS TABLE (Wksp WO reports to MTO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number text UNIQUE NOT NULL,
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  reported_by_id uuid REFERENCES public.profiles(id) NOT NULL, -- Wksp WO
  report_type text CHECK (report_type IN ('bimonthly_inspection', 'monthly_summary', 'special_incident', 'efficiency_report')),
  inspections_completed integer DEFAULT 0,
  repairs_completed integer DEFAULT 0,
  repairs_pending integer DEFAULT 0,
  repairs_referred integer DEFAULT 0,
  equipment_serviceable_count integer DEFAULT 0,
  equipment_unserviceable_count integer DEFAULT 0,
  workshop_efficiency_rating text,
  personnel_training_completed text[],
  civilian_tradesmen_performance text,
  irregularities_reported text[],
  recommendations text,
  submitted_to_mto boolean DEFAULT false,
  submitted_date date,
  mto_reviewed boolean DEFAULT false,
  mto_reviewed_date date,
  report_content text, -- Full written report text
  attachments text[], -- URLs to attached documents
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.mt_work_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_driver_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_driver_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_vehicle_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt_detail_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pol_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pol_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jerrican_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies - will be enhanced in Phase 2 with department access control
-- For now, all authenticated users can view, MTO/WKSP_WO/S4/CO can manage

-- RLS Policies for MT tables - MTO, S4, CO have full access
CREATE POLICY "MT tables viewable by authenticated users"
  ON public.mt_work_tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MT tables manageable by MTO S4 CO"
  ON public.mt_work_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('MTO', 'S4', 'CO')
      AND ur.status = 'approved'
    )
  );

-- Similar policies for other MT tables (simplified for now)
-- Full department-based access control will be added in Phase 2

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mt_work_tickets_vehicle ON public.mt_work_tickets(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_mt_work_tickets_driver ON public.mt_work_tickets(driver_id);
CREATE INDEX IF NOT EXISTS idx_mt_work_tickets_date ON public.mt_work_tickets(issue_date);
CREATE INDEX IF NOT EXISTS idx_mt_driver_permits_driver ON public.mt_driver_permits(driver_id);
CREATE INDEX IF NOT EXISTS idx_mt_driver_permits_status ON public.mt_driver_permits(status);
CREATE INDEX IF NOT EXISTS idx_mt_accidents_vehicle ON public.mt_accidents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_mt_accidents_date ON public.mt_accidents(accident_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle ON public.vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_type ON public.vehicle_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_workshop_inspections_date ON public.workshop_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_workshop_repairs_status ON public.workshop_repairs(repair_status);

