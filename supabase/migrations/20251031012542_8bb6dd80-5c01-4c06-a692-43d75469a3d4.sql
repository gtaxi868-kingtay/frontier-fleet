-- Avoid recursive RLS on profiles by using a security definer helper
CREATE OR REPLACE FUNCTION public.get_user_unit_id(uid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.profiles WHERE id = uid
$$;

-- Replace recursive policy with function-based policy
DROP POLICY IF EXISTS "Users can view unit profiles" ON public.profiles;
CREATE POLICY "Users can view unit profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_user_unit_id(auth.uid()) IS NOT NULL
  AND public.get_user_unit_id(auth.uid()) = profiles.unit_id
);
