-- Phase 1.2: Create Department/Sub-Unit Structure
-- MT Department: Belongs to Support Squadron but operates independently, reports to S4
-- Workshop: Under EME Squadron
-- POL: Sub-unit of MT

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('MT', 'Workshop', 'POL')),
  parent_unit_id uuid REFERENCES public.units(id), -- Unit department belongs to (Support for MT, EME for Workshop)
  operating_unit_id uuid REFERENCES public.units(id), -- Unit department operates from (can be same or different)
  description text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- Create department_assignments table for linking personnel to departments
CREATE TABLE IF NOT EXISTS public.department_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  role text, -- MTO, WKSP_WO, etc.
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, department_id)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments - all authenticated users can view
CREATE POLICY "All authenticated users can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

-- Only S4 and CO can manage departments
CREATE POLICY "S4 and CO can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON ur.user_id = p.id
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('S4', 'CO')
      AND ur.status = 'approved'
    )
  );

-- RLS Policies for department_assignments - users can view their own assignments
CREATE POLICY "Users can view their own department assignments"
  ON public.department_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- All authenticated users can view department assignments
CREATE POLICY "All authenticated users can view department assignments"
  ON public.department_assignments FOR SELECT
  TO authenticated
  USING (true);

-- S4 and CO can manage department assignments
CREATE POLICY "S4 and CO can manage department assignments"
  ON public.department_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('S4', 'CO')
      AND ur.status = 'approved'
    )
  );

-- Insert departments (need to get unit IDs dynamically)
-- MT Department - belongs to Support Squadron
-- Workshop - belongs to EME Squadron
-- POL - sub-unit of MT

DO $$
DECLARE
  support_unit_id uuid;
  eme_unit_id uuid;
  mt_dept_id uuid;
BEGIN
  -- Get Support Squadron ID
  SELECT id INTO support_unit_id FROM public.units WHERE name = 'Support Squadron' LIMIT 1;
  
  -- Get EME Squadron ID
  SELECT id INTO eme_unit_id FROM public.units WHERE name = 'EME Squadron' LIMIT 1;
  
  -- Insert MT Department (linked to Support but independent)
  IF support_unit_id IS NOT NULL THEN
    INSERT INTO public.departments (name, type, parent_unit_id, operating_unit_id, description, location)
    VALUES (
      'Motor Transport (MT)',
      'MT',
      support_unit_id,
      support_unit_id,
      'Motor Transport Department - operates independently, reports to S4',
      'Teteron Barracks'
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO mt_dept_id;
  END IF;
  
  -- Insert Workshop (linked to EME)
  IF eme_unit_id IS NOT NULL THEN
    INSERT INTO public.departments (name, type, parent_unit_id, operating_unit_id, description, location)
    VALUES (
      'Workshop',
      'Workshop',
      eme_unit_id,
      eme_unit_id,
      'Workshop under EME Squadron - equipment inspection and repair',
      'Teteron Barracks'
    )
    ON CONFLICT (name) DO NOTHING;
  END IF;
  
  -- Insert POL as sub-unit of MT
  IF mt_dept_id IS NOT NULL THEN
    INSERT INTO public.departments (name, type, parent_unit_id, operating_unit_id, description, location)
    VALUES (
      'POL (Petrol, Oil, Lubricants)',
      'POL',
      support_unit_id,
      support_unit_id,
      'POL storage and management - sub-unit of MT',
      'Teteron Barracks'
    )
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_departments_parent_unit ON public.departments(parent_unit_id);
CREATE INDEX IF NOT EXISTS idx_departments_type ON public.departments(type);
CREATE INDEX IF NOT EXISTS idx_department_assignments_user ON public.department_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_department_assignments_dept ON public.department_assignments(department_id);

