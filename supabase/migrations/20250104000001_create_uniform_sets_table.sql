-- Create uniform_sets table to track complete uniform configurations
-- This table stores predefined uniform sets (e.g., No#4D Combat Uniform) and their components

CREATE TABLE IF NOT EXISTS public.uniform_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id text UNIQUE NOT NULL,
  set_name text NOT NULL,
  dress_type text NOT NULL, -- e.g., "No#1", "No#4D", "No#7A"
  description text,
  components jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of component item names or uniform_ids
  squadron_id uuid REFERENCES public.units(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on dress_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_uniform_sets_dress_type ON public.uniform_sets(dress_type);
CREATE INDEX IF NOT EXISTS idx_uniform_sets_squadron_id ON public.uniform_sets(squadron_id);

-- Enable RLS
ALTER TABLE public.uniform_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uniform_sets
CREATE POLICY "All authenticated users can view uniform sets"
  ON public.uniform_sets FOR SELECT 
  USING (true);

CREATE POLICY "S4 and SQMS can manage uniform sets"
  ON public.uniform_sets FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('S4'::app_role, 'SQMS'::app_role)
      AND ur.status = 'approved'
    )
  );

-- Add comments
COMMENT ON TABLE public.uniform_sets IS 'Stores complete uniform set configurations based on military dress regulations';
COMMENT ON COLUMN public.uniform_sets.set_id IS 'Unique identifier for the uniform set (e.g., SET-NO4D-001)';
COMMENT ON COLUMN public.uniform_sets.set_name IS 'Display name for the uniform set (e.g., "No#4D Combat Uniform (BDU)")';
COMMENT ON COLUMN public.uniform_sets.dress_type IS 'Military dress type code (e.g., No#1, No#4D, No#7A)';
COMMENT ON COLUMN public.uniform_sets.components IS 'JSON array of component item names that make up this uniform set';

