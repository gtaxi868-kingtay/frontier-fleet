-- Add approval status to user_roles
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.user_roles 
ADD COLUMN status public.approval_status NOT NULL DEFAULT 'pending';

-- Function to check CO limit (only 1 approved CO allowed)
CREATE OR REPLACE FUNCTION public.check_co_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'CO' AND NEW.status = 'approved' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE role = 'CO' 
      AND status = 'approved' 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one CO role can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to check S4 limit (only 1 approved S4 allowed)
CREATE OR REPLACE FUNCTION public.check_s4_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'S4' AND NEW.status = 'approved' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE role = 'S4' 
      AND status = 'approved'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one S4 role can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to check OC limit (max 5 approved OCs total)
CREATE OR REPLACE FUNCTION public.check_oc_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'OC' AND NEW.status = 'approved' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'OC' AND status = 'approved' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 5 THEN
      RAISE EXCEPTION 'Maximum of 5 OC roles can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to check SQMS limit (1 per unit)
CREATE OR REPLACE FUNCTION public.check_sqms_per_unit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_unit_id uuid;
BEGIN
  IF NEW.role = 'SQMS' AND NEW.status = 'approved' THEN
    -- Get the user's unit_id from profiles
    SELECT unit_id INTO user_unit_id FROM public.profiles WHERE id = NEW.user_id;
    
    IF user_unit_id IS NOT NULL THEN
      IF EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.profiles p ON ur.user_id = p.id
        WHERE ur.role = 'SQMS' 
        AND ur.status = 'approved'
        AND p.unit_id = user_unit_id
        AND ur.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN
        RAISE EXCEPTION 'Only one SQMS role per unit can be approved';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER enforce_co_limit
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.check_co_limit();

CREATE TRIGGER enforce_s4_limit
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.check_s4_limit();

CREATE TRIGGER enforce_oc_limit
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.check_oc_limit();

CREATE TRIGGER enforce_sqms_limit
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.check_sqms_per_unit();

-- Allow users to insert their own role request (pending by default)
CREATE POLICY "Users can request roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- CO and S4 can approve role requests
CREATE POLICY "CO and S4 can manage role approvals"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'CO') OR has_role(auth.uid(), 'S4'))
WITH CHECK (has_role(auth.uid(), 'CO') OR has_role(auth.uid(), 'S4'));