-- Fix explosives table security - restrict view access to S4 only
-- Drop the overly permissive policy that allows all authenticated users to view explosives
DROP POLICY IF EXISTS "All authenticated users can view explosives" ON public.explosives;

-- Create restricted policy: Only S4 can view explosives inventory
CREATE POLICY "Only S4 can view explosives" 
ON public.explosives 
FOR SELECT 
USING (has_role(auth.uid(), 'S4'::app_role));