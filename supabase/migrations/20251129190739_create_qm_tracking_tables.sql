-- Phase 1.4: QM Tracking Tables
-- Barracks Stores (TTR Form 57), Clothing & Equipment (TTR Form 21), Company Stores

-- ============================================================================
-- BARRACKS STORES TABLE (TTR Form 57)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.barracks_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text UNIQUE NOT NULL,
  item_name text NOT NULL,
  item_type text NOT NULL, -- Standardized designation (BEDSTEADS, CHAIRS, etc.)
  unit_id uuid REFERENCES public.units(id), -- Unit holding the store
  quantity_total integer DEFAULT 0,
  quantity_available integer DEFAULT 0,
  quantity_issued integer DEFAULT 0,
  condition text CHECK (condition IN ('serviceable', 'unserviceable', 'needs_repair')),
  location text,
  last_inspection_date date,
  last_exchanged_date date,
  condemnation_date date,
  condemnation_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- BARRACKS STORES DISTRIBUTION TABLE (Room-level distribution)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.barracks_stores_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barracks_store_id uuid REFERENCES public.barracks_stores(id) ON DELETE CASCADE,
  room_id uuid REFERENCES public.room_inventory(id), -- Link to room
  room_identifier text, -- Room ID for reference
  quantity integer NOT NULL DEFAULT 0,
  condition_on_issue text,
  condition_current text,
  issued_date date,
  removed_date date,
  removal_authorized_by uuid REFERENCES public.profiles(id), -- CO or QM only
  removal_reason text,
  returned_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CLOTHING EQUIPMENT SCALE TABLE (Standard scales per rank)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clothing_equipment_scale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank text NOT NULL,
  item_name text NOT NULL,
  quantity_authorized integer NOT NULL DEFAULT 1,
  life_expectancy_months integer, -- Expected life in months
  category text, -- 'clothing', 'equipment', 'necessaries'
  scale_type text DEFAULT 'regular' CHECK (scale_type IN ('regular', 'volunteer')), -- Regular vs Volunteer scale
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(rank, item_name, scale_type)
);

-- ============================================================================
-- CLOTHING EQUIPMENT ISSUES TABLE (TTR Form 21 - Issue/return tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clothing_equipment_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number text UNIQUE NOT NULL,
  soldier_id uuid REFERENCES public.profiles(id) NOT NULL,
  item_name text NOT NULL,
  item_category text CHECK (item_category IN ('clothing', 'equipment', 'necessaries')),
  quantity_issued integer DEFAULT 1,
  issue_date date NOT NULL,
  issued_by_id uuid REFERENCES public.profiles(id), -- CQMS
  condition_on_issue text,
  regimental_number_marked boolean DEFAULT false, -- Marking requirement
  marking_location text, -- Where marked (waistband, pocket, etc.)
  return_date date,
  returned_by_id uuid REFERENCES public.profiles(id),
  condition_on_return text,
  exchange_requested boolean DEFAULT false,
  exchange_reason text CHECK (exchange_reason IN ('unserviceable', 'shrinkage', 'outgrown', 'damage', 'missing', 'other')),
  exchange_approved boolean DEFAULT false,
  exchange_approved_by_id uuid REFERENCES public.profiles(id),
  exchange_date date,
  condemnation_date date,
  condemnation_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CLOTHING EXCHANGES TABLE (Monthly exchange process)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clothing_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_month date NOT NULL, -- Year-month
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  item_name text NOT NULL,
  quantity_exchanged integer DEFAULT 0,
  exchange_reason text,
  items_handed_in text[], -- List of item IDs handed in
  items_issued text[], -- List of item IDs issued
  exchange_date date NOT NULL,
  processed_by_id uuid REFERENCES public.profiles(id), -- CQMS
  qm_reviewed boolean DEFAULT false,
  qm_approved boolean DEFAULT false,
  qm_decision text, -- QM final decision on exchangeability
  qm_reviewed_by_id uuid REFERENCES public.profiles(id), -- QM
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- KIT INSPECTIONS TABLE (Monthly kit inspections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kit_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_date date NOT NULL,
  soldier_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id uuid REFERENCES public.units(id),
  inspected_by_id uuid REFERENCES public.profiles(id), -- Coy 2IC or Platoon Commander
  inspector_rank text,
  items_at_scale integer DEFAULT 0, -- Count of items at scale
  items_below_scale integer DEFAULT 0,
  items_exceeding_scale integer DEFAULT 0,
  deficiencies text[], -- List of deficient items
  exchange_requests text[], -- List of items needing exchange
  serviceability_focus text, -- Notes on serviceability assessment
  inspection_notes text,
  follow_up_required boolean DEFAULT false,
  follow_up_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- COMPANY STORES TABLE (CQMS managed stores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  store_category text NOT NULL CHECK (store_category IN ('arms', 'equipment', 'accommodation', 'other')),
  item_name text NOT NULL,
  item_type text,
  quantity_total integer DEFAULT 0,
  quantity_available integer DEFAULT 0,
  quantity_issued integer DEFAULT 0,
  storage_location text,
  last_checked_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- LAUNDRY BOOK TABLE (Laundry contract tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.laundry_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL,
  unit_id uuid REFERENCES public.units(id),
  soldier_id uuid REFERENCES public.profiles(id),
  bundle_number text,
  articles_count integer NOT NULL CHECK (articles_count <= 25), -- Max 25 articles per week
  kd_garments_count integer CHECK (kd_garments_count <= 3), -- Max 3 KD garments per half bundle
  handed_in_date date NOT NULL,
  handed_in_by text, -- Storeman or CQMS
  collected_date date,
  collected_by_id uuid REFERENCES public.profiles(id),
  service_provider text, -- Laundry contract provider
  weekly_total boolean DEFAULT false, -- Indicates if this is part of weekly total (max 25)
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- BOOT BOOK TABLE (TTR Form 84 - Boot repair tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.boot_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE NOT NULL,
  soldier_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id uuid REFERENCES public.units(id),
  boot_type text CHECK (boot_type IN ('ankle', 'canvas', 'other')),
  handed_in_date date NOT NULL,
  handed_in_by text, -- CQMS or storeman
  handed_in_condition text,
  repair_required text[], -- Array of repair types (studding, repair, etc.)
  cobbler_received_date date,
  cobbler_assigned text,
  repair_status text DEFAULT 'pending' CHECK (repair_status IN ('pending', 'in_progress', 'completed', 'condemned', 'beyond_repair')),
  repair_completed_date date,
  repair_cost decimal(10,2),
  unserviceable_reason text, -- If beyond economical repair
  condemnation_certificate_issued boolean DEFAULT false, -- TTR Form 77
  condemnation_certificate_number text,
  exchange_requested boolean DEFAULT false,
  exchange_approved boolean DEFAULT false,
  exchange_issued_date date,
  disciplinary_action_required boolean DEFAULT false, -- If unfair wear/tear
  disciplinary_action_taken text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TAILOR BOOK TABLE (Clothing repair/alteration tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tailor_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE NOT NULL,
  soldier_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id uuid REFERENCES public.units(id),
  item_name text NOT NULL,
  regimental_number_verified boolean DEFAULT false, -- Must have number before tailoring
  work_type text CHECK (work_type IN ('repair', 'alteration', 'both')),
  work_description text NOT NULL,
  submitted_date date NOT NULL,
  submitted_by text, -- CQMS or storeman
  tailor_assigned text, -- Bn tailor or contract tailor
  date_to_tailor date,
  date_from_tailor date,
  tailor_signature text,
  storeman_received_signature text,
  owner_collected_signature text,
  work_status text DEFAULT 'pending' CHECK (work_status IN ('pending', 'with_tailor', 'completed', 'returned')),
  completed_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- BEDDING BOOK TABLE (Weekly bedding checks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bedding_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_date date NOT NULL,
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  room_id text,
  soldier_id uuid REFERENCES public.profiles(id),
  sheets_count integer DEFAULT 3, -- Scale: 3 sheets
  pillowcases_count integer DEFAULT 2, -- Scale: 2 pillowcases
  lightweight_blankets integer DEFAULT 1, -- Scale: 1 lightweight blanket
  heavyweight_blankets integer DEFAULT 1, -- Scale: 1 heavyweight blanket
  pillows integer DEFAULT 1, -- Scale: 1 pillow
  mattresses integer DEFAULT 1, -- Scale: 1 mattress
  sheets_laundered boolean DEFAULT false, -- Weekly laundering
  blankets_aired boolean DEFAULT false, -- Weekly airing requirement
  last_laundered_date date,
  last_aired_date date,
  deficiencies text[],
  check_completed_by text, -- CQMS or storeman
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- REPAIR BOOK TABLE (Accommodation damage tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.repair_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE NOT NULL,
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  room_id text,
  damage_type text CHECK (damage_type IN ('accommodation', 'furniture', 'fixtures', 'other')),
  damage_description text NOT NULL,
  damage_date date NOT NULL,
  reported_date date NOT NULL,
  caused_by_id uuid REFERENCES public.profiles(id), -- Individual who caused damage (if known)
  caused_by_name text, -- If not a system user
  cause_type text CHECK (cause_type IN ('fair_wear_tear', 'accident', 'misuse', 'willful', 'unknown')),
  notified_to_qm boolean DEFAULT false,
  notified_to_qm_date date,
  repair_started_date date,
  repair_completed_date date,
  repair_type text CHECK (repair_type IN ('unit_pioneer', 'government_works', 'civilian_contractor', 'other')),
  repair_cost decimal(10,2),
  disciplinary_action_taken boolean DEFAULT false,
  disciplinary_action_details text,
  barrack_charge_applied boolean DEFAULT false, -- Charge to sub-unit if individual unknown
  barrack_charge_amount decimal(10,2),
  co_decision text, -- CO decision on cost allocation
  written_off boolean DEFAULT false, -- Written off as public charge
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'repairing', 'completed', 'closed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.barracks_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barracks_stores_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_equipment_scale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_equipment_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boot_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailor_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bedding_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_book ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies - unit-based filtering will be added in Phase 2
-- All authenticated users can view their unit's data
-- SQMS/CQMS/S4/CO can manage

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_barracks_stores_unit ON public.barracks_stores(unit_id);
CREATE INDEX IF NOT EXISTS idx_barracks_stores_distribution_store ON public.barracks_stores_distribution(barracks_store_id);
CREATE INDEX IF NOT EXISTS idx_barracks_stores_distribution_room ON public.barracks_stores_distribution(room_id);
CREATE INDEX IF NOT EXISTS idx_clothing_issues_soldier ON public.clothing_equipment_issues(soldier_id);
CREATE INDEX IF NOT EXISTS idx_clothing_issues_date ON public.clothing_equipment_issues(issue_date);
CREATE INDEX IF NOT EXISTS idx_kit_inspections_soldier ON public.kit_inspections(soldier_id);
CREATE INDEX IF NOT EXISTS idx_kit_inspections_date ON public.kit_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_laundry_book_soldier ON public.laundry_book(soldier_id);
CREATE INDEX IF NOT EXISTS idx_boot_book_soldier ON public.boot_book(soldier_id);
CREATE INDEX IF NOT EXISTS idx_tailor_book_soldier ON public.tailor_book(soldier_id);
CREATE INDEX IF NOT EXISTS idx_repair_book_unit ON public.repair_book(unit_id);
CREATE INDEX IF NOT EXISTS idx_repair_book_date ON public.repair_book(damage_date);

