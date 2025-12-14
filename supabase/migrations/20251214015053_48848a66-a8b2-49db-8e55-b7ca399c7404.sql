-- =====================================================
-- MISSING DATABASE TABLES FOR 1st ENGINEER BATTALION IBIMS
-- =====================================================

-- 1. BARRACKS STORES TABLE
CREATE TABLE IF NOT EXISTS public.barracks_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  qty_on_hand INTEGER DEFAULT 0,
  qty_issued INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  serviceable BOOLEAN DEFAULT true,
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.barracks_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view barracks stores"
ON public.barracks_stores FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage barracks stores"
ON public.barracks_stores FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 2. BARRACKS STORES DISTRIBUTION TABLE
CREATE TABLE IF NOT EXISTS public.barracks_stores_distribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barracks_store_id UUID REFERENCES public.barracks_stores(id) ON DELETE CASCADE,
  soldier_id UUID REFERENCES public.profiles(id),
  quantity INTEGER DEFAULT 1,
  issue_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  condition_issue TEXT,
  condition_return TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.barracks_stores_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view distribution"
ON public.barracks_stores_distribution FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage distribution"
ON public.barracks_stores_distribution FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 3. BEDDING BOOK TABLE
CREATE TABLE IF NOT EXISTS public.bedding_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  soldier_id UUID REFERENCES public.profiles(id),
  check_date DATE NOT NULL,
  mattress_condition TEXT,
  blanket_condition TEXT,
  pillow_condition TEXT,
  bedsheet_condition TEXT,
  inspector_id UUID REFERENCES public.profiles(id),
  remarks TEXT,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bedding_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view bedding book"
ON public.bedding_book FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage bedding book"
ON public.bedding_book FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 4. BOOT BOOK TABLE
CREATE TABLE IF NOT EXISTS public.boot_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_number TEXT NOT NULL,
  soldier_id UUID REFERENCES public.profiles(id),
  boot_type TEXT NOT NULL,
  boot_size TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  condition_issue TEXT,
  condition_return TEXT,
  inspector_id UUID REFERENCES public.profiles(id),
  remarks TEXT,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.boot_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view boot book"
ON public.boot_book FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage boot book"
ON public.boot_book FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 5. LAUNDRY BOOK TABLE
CREATE TABLE IF NOT EXISTS public.laundry_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  soldier_id UUID REFERENCES public.profiles(id),
  item_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  sent_date DATE,
  return_date DATE,
  condition TEXT,
  inspector_id UUID REFERENCES public.profiles(id),
  remarks TEXT,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.laundry_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view laundry book"
ON public.laundry_book FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage laundry book"
ON public.laundry_book FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 6. TAILOR BOOK TABLE
CREATE TABLE IF NOT EXISTS public.tailor_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  soldier_id UUID REFERENCES public.profiles(id),
  item_type TEXT NOT NULL,
  description TEXT,
  sent_date DATE,
  return_date DATE,
  cost DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  inspector_id UUID REFERENCES public.profiles(id),
  remarks TEXT,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tailor_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view tailor book"
ON public.tailor_book FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage tailor book"
ON public.tailor_book FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 7. REPAIR BOOK TABLE
CREATE TABLE IF NOT EXISTS public.repair_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  item_type TEXT NOT NULL,
  item_description TEXT,
  defect_description TEXT,
  sent_date DATE,
  return_date DATE,
  repair_status TEXT DEFAULT 'Pending',
  cost DECIMAL(10,2),
  inspector_id UUID REFERENCES public.profiles(id),
  remarks TEXT,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.repair_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view repair book"
ON public.repair_book FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage repair book"
ON public.repair_book FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 8. KIT INSPECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.kit_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  soldier_id UUID REFERENCES public.profiles(id) NOT NULL,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_id UUID REFERENCES public.profiles(id),
  overall_status TEXT DEFAULT 'Pass',
  uniform_status TEXT,
  equipment_status TEXT,
  notes TEXT,
  deficiencies JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_completed BOOLEAN DEFAULT false,
  squadron_id UUID REFERENCES public.units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kit_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view kit inspections"
ON public.kit_inspections FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, OC, and STOREMAN can manage kit inspections"
ON public.kit_inspections FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'OC'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 9. CLOTHING EQUIPMENT SCALE TABLE
CREATE TABLE IF NOT EXISTS public.clothing_equipment_scale (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT,
  category TEXT NOT NULL,
  authorized_quantity INTEGER DEFAULT 1,
  size_required BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clothing_equipment_scale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view clothing scale"
ON public.clothing_equipment_scale FOR SELECT USING (true);

CREATE POLICY "S4 and S4_ADMIN can manage clothing scale"
ON public.clothing_equipment_scale FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role));

-- 10. CLOTHING EQUIPMENT ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.clothing_equipment_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  soldier_id UUID REFERENCES public.profiles(id) NOT NULL,
  item_id UUID REFERENCES public.clothing_equipment_scale(id),
  item_name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER DEFAULT 1,
  issue_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  condition_issue TEXT DEFAULT 'Good',
  condition_return TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clothing_equipment_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view clothing issues"
ON public.clothing_equipment_issues FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage clothing issues"
ON public.clothing_equipment_issues FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 11. CLOTHING EXCHANGES TABLE
CREATE TABLE IF NOT EXISTS public.clothing_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  soldier_id UUID REFERENCES public.profiles(id) NOT NULL,
  exchange_month TEXT NOT NULL,
  exchange_year INTEGER NOT NULL,
  items_exchanged JSONB DEFAULT '[]'::jsonb,
  total_items INTEGER DEFAULT 0,
  processed_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'Pending',
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clothing_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view clothing exchanges"
ON public.clothing_exchanges FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage clothing exchanges"
ON public.clothing_exchanges FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role) OR has_role(auth.uid(), 'SQMS'::app_role) OR has_role(auth.uid(), 'STOREMAN'::app_role));

-- 12. MT DRIVER PERMITS TABLE
CREATE TABLE IF NOT EXISTS public.mt_driver_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_number TEXT NOT NULL,
  soldier_id UUID REFERENCES public.profiles(id) NOT NULL,
  vehicle_classes TEXT[] DEFAULT '{}',
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'Valid',
  issued_by UUID REFERENCES public.profiles(id),
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mt_driver_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view driver permits"
ON public.mt_driver_permits FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, MTO can manage driver permits"
ON public.mt_driver_permits FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role));

-- 13. MT WORK TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.mt_work_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.profiles(id),
  purpose TEXT NOT NULL,
  destination TEXT,
  start_mileage INTEGER,
  end_mileage INTEGER,
  fuel_issued DECIMAL(10,2),
  departure_time TIMESTAMP WITH TIME ZONE,
  return_time TIMESTAMP WITH TIME ZONE,
  authorized_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'Active',
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mt_work_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view work tickets"
ON public.mt_work_tickets FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, MTO can manage work tickets"
ON public.mt_work_tickets FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role));

-- 14. POL TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.pol_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fuel_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  work_ticket_id UUID REFERENCES public.mt_work_tickets(id),
  received_from TEXT,
  issued_to TEXT,
  opening_balance DECIMAL(10,2),
  closing_balance DECIMAL(10,2),
  authorized_by UUID REFERENCES public.profiles(id),
  squadron_id UUID REFERENCES public.units(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pol_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view POL transactions"
ON public.pol_transactions FOR SELECT USING (true);

CREATE POLICY "S4, S4_ADMIN, MTO can manage POL transactions"
ON public.pol_transactions FOR ALL
USING (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role));

-- Create triggers for updated_at columns
CREATE TRIGGER update_barracks_stores_updated_at BEFORE UPDATE ON public.barracks_stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bedding_book_updated_at BEFORE UPDATE ON public.bedding_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_boot_book_updated_at BEFORE UPDATE ON public.boot_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_laundry_book_updated_at BEFORE UPDATE ON public.laundry_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tailor_book_updated_at BEFORE UPDATE ON public.tailor_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repair_book_updated_at BEFORE UPDATE ON public.repair_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kit_inspections_updated_at BEFORE UPDATE ON public.kit_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clothing_equipment_scale_updated_at BEFORE UPDATE ON public.clothing_equipment_scale FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clothing_equipment_issues_updated_at BEFORE UPDATE ON public.clothing_equipment_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clothing_exchanges_updated_at BEFORE UPDATE ON public.clothing_exchanges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mt_driver_permits_updated_at BEFORE UPDATE ON public.mt_driver_permits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mt_work_tickets_updated_at BEFORE UPDATE ON public.mt_work_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();