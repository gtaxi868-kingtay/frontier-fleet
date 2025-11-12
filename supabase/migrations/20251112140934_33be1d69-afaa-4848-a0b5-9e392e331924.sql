-- Phase 1 & 2: Role System Expansion - Part 2 (Tables, Functions, Triggers, RLS)

-- Step 1: Create role limit functions for new roles

-- Create check for S1 (only 1 allowed)
CREATE OR REPLACE FUNCTION public.check_s1_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'S1' AND NEW.status = 'approved' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE role = 'S1' 
      AND status = 'approved'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one S1 role can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create check for S4_ADMIN (max 4 allowed)
CREATE OR REPLACE FUNCTION public.check_s4_admin_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'S4_ADMIN' AND NEW.status = 'approved' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'S4_ADMIN' AND status = 'approved' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 4 THEN
      RAISE EXCEPTION 'Maximum of 4 S4_ADMIN roles can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create check for STOREMAN (max 1 per unit)
CREATE OR REPLACE FUNCTION public.check_storeman_per_unit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_unit_id uuid;
BEGIN
  IF NEW.role = 'STOREMAN' AND NEW.status = 'approved' THEN
    SELECT unit_id INTO user_unit_id FROM public.profiles WHERE id = NEW.user_id;
    
    IF user_unit_id IS NOT NULL THEN
      IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.profiles p ON ur.user_id = p.id
        WHERE ur.role = 'STOREMAN' 
        AND ur.status = 'approved'
        AND p.unit_id = user_unit_id
        AND ur.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN
        RAISE EXCEPTION 'Only one STOREMAN role per unit can be approved';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for new role limits
DROP TRIGGER IF EXISTS check_s1_limit_trigger ON public.user_roles;
CREATE TRIGGER check_s1_limit_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.check_s1_limit();

DROP TRIGGER IF EXISTS check_s4_admin_limit_trigger ON public.user_roles;
CREATE TRIGGER check_s4_admin_limit_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.check_s4_admin_limit();

DROP TRIGGER IF EXISTS check_storeman_per_unit_trigger ON public.user_roles;
CREATE TRIGGER check_storeman_per_unit_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.check_storeman_per_unit();

-- Step 2: Create inventory_requests table
CREATE TABLE IF NOT EXISTS public.inventory_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) NOT NULL,
  requester_role app_role NOT NULL,
  unit_id UUID REFERENCES public.units(id),
  request_type TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT,
  quantity INTEGER DEFAULT 1,
  specifications TEXT,
  justification TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES public.profiles(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  report_generated BOOLEAN DEFAULT false,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inventory_requests ENABLE ROW LEVEL SECURITY;

-- Step 3: Create transactions_detailed table
CREATE TABLE IF NOT EXISTS public.transactions_detailed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  item_table TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_name TEXT,
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  quantity INTEGER DEFAULT 1,
  issued_by_id UUID REFERENCES public.profiles(id),
  unit_id UUID REFERENCES public.units(id),
  condition_issue TEXT,
  condition_return TEXT,
  serviceability TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.transactions_detailed ENABLE ROW LEVEL SECURITY;

-- Step 4: Create approvals_queue table
CREATE TABLE IF NOT EXISTS public.approvals_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.inventory_requests(id) ON DELETE CASCADE,
  approval_level TEXT NOT NULL,
  required_role app_role NOT NULL,
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.approvals_queue ENABLE ROW LEVEL SECURITY;

-- Step 5: Enhance alerts table
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS alert_type TEXT DEFAULT 'general';
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS related_item_id UUID;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS related_item_type TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT false;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Step 6: Create unit-based filtering function
CREATE OR REPLACE FUNCTION public.user_has_unit_access(check_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.status = 'approved'
    AND ur.role IN ('CO', 'S1', 'S4', 'S4_ADMIN')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.unit_id = check_unit_id
  );
$$;

-- Step 7: Update RLS policies for new tables

-- inventory_requests policies
CREATE POLICY "Users can view their own requests"
ON public.inventory_requests FOR SELECT
USING (requester_id = auth.uid());

CREATE POLICY "Command roles can view all requests"
ON public.inventory_requests FOR SELECT
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN')
);

CREATE POLICY "Unit roles can view unit requests"
ON public.inventory_requests FOR SELECT
USING (user_has_unit_access(unit_id));

CREATE POLICY "OC and SQMS can create requests"
ON public.inventory_requests FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'OC') OR has_role(auth.uid(), 'SQMS')) 
  AND requester_id = auth.uid()
);

CREATE POLICY "S4 roles can update requests"
ON public.inventory_requests FOR UPDATE
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'CO')
);

-- transactions_detailed policies
CREATE POLICY "All authenticated users can view transactions"
ON public.transactions_detailed FOR SELECT
USING (true);

CREATE POLICY "STOREMAN and SQMS can create transactions"
ON public.transactions_detailed FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'STOREMAN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN')
);

-- approvals_queue policies
CREATE POLICY "Approvers can view their approvals"
ON public.approvals_queue FOR SELECT
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'OC')
);

CREATE POLICY "System can create approvals"
ON public.approvals_queue FOR INSERT
WITH CHECK (true);

CREATE POLICY "Approvers can update approvals"
ON public.approvals_queue FOR UPDATE
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'OC')
);

-- Step 8: Update existing inventory table RLS policies

-- Weapons
DROP POLICY IF EXISTS "S4 and SQMS can manage weapons" ON public.weapons;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage weapons"
ON public.weapons FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Tools
DROP POLICY IF EXISTS "S4 and SQMS can manage tools" ON public.tools;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage tools"
ON public.tools FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Vehicles
DROP POLICY IF EXISTS "S4 and SQMS can manage vehicles" ON public.vehicles;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage vehicles"
ON public.vehicles FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Engineer Equipment
DROP POLICY IF EXISTS "S4 and SQMS can manage engineer equipment" ON public.engineer_equipment;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage engineer equipment"
ON public.engineer_equipment FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Plant Machinery
DROP POLICY IF EXISTS "S4 and SQMS can manage plant machinery" ON public.plant_machinery;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage plant machinery"
ON public.plant_machinery FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Mechanics Tools
DROP POLICY IF EXISTS "S4 and SQMS can manage mechanics tools" ON public.mechanics_tools;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage mechanics tools"
ON public.mechanics_tools FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- MT Facilities
DROP POLICY IF EXISTS "S4 and SQMS can manage MT facilities" ON public.mt_facilities;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage MT facilities"
ON public.mt_facilities FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- PPE
DROP POLICY IF EXISTS "S4 and SQMS can manage PPE" ON public.ppe;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage PPE"
ON public.ppe FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Uniforms
DROP POLICY IF EXISTS "S4 and SQMS can manage uniforms" ON public.uniforms;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage uniforms"
ON public.uniforms FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- General Inventory
DROP POLICY IF EXISTS "S4 and SQMS can manage general inventory" ON public.general_inventory;
CREATE POLICY "S4, S4_ADMIN, SQMS, and STOREMAN can manage general inventory"
ON public.general_inventory FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Works Materials
DROP POLICY IF EXISTS "S4, OC, and SQMS can manage works materials" ON public.works_materials;
CREATE POLICY "S4, S4_ADMIN, OC, SQMS, and STOREMAN can manage works materials"
ON public.works_materials FOR ALL
USING (
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'OC') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Room Inventory
DROP POLICY IF EXISTS "OC, S4, and SQMS can manage room inventory" ON public.room_inventory;
CREATE POLICY "OC, S4, S4_ADMIN, SQMS, and STOREMAN can manage room inventory"
ON public.room_inventory FOR ALL
USING (
  has_role(auth.uid(), 'OC') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'SQMS') OR 
  has_role(auth.uid(), 'STOREMAN')
);

-- Facilities
DROP POLICY IF EXISTS "CO and S4 can manage facilities" ON public.facilities;
CREATE POLICY "CO, S1, S4, and S4_ADMIN can manage facilities"
ON public.facilities FOR ALL
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN')
);

-- Reports
DROP POLICY IF EXISTS "CO, S4, OC can create reports" ON public.reports;
CREATE POLICY "CO, S1, S4, S4_ADMIN, OC can create reports"
ON public.reports FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN') OR 
  has_role(auth.uid(), 'OC')
);

-- Units
DROP POLICY IF EXISTS "CO and S4 can manage units" ON public.units;
CREATE POLICY "CO, S1, S4, and S4_ADMIN can manage units"
ON public.units FOR ALL
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN')
);

-- Profiles
DROP POLICY IF EXISTS "Command staff can view all profiles" ON public.profiles;
CREATE POLICY "Command staff can view all profiles"
ON public.profiles FOR SELECT
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4') OR 
  has_role(auth.uid(), 'S4_ADMIN')
);

-- User Roles
DROP POLICY IF EXISTS "CO and S4 can view all role requests" ON public.user_roles;
CREATE POLICY "CO, S1, and S4 can view all role requests"
ON public.user_roles FOR SELECT
USING (
  has_role(auth.uid(), 'CO') OR 
  has_role(auth.uid(), 'S1') OR 
  has_role(auth.uid(), 'S4')
);

-- Step 9: Add triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_inventory_requests_updated_at ON public.inventory_requests;
CREATE TRIGGER update_inventory_requests_updated_at
  BEFORE UPDATE ON public.inventory_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_approvals_queue_updated_at ON public.approvals_queue;
CREATE TRIGGER update_approvals_queue_updated_at
  BEFORE UPDATE ON public.approvals_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();