-- Fix profile visibility security issue
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restricted profile visibility policies
-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can view profiles within their unit
CREATE POLICY "Users can view unit profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS viewer
    WHERE viewer.id = auth.uid() 
    AND viewer.unit_id IS NOT NULL
    AND viewer.unit_id = profiles.unit_id
  )
);

-- Policy 3: CO and S4 can view all profiles (chain of command)
CREATE POLICY "Command staff can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'CO'::app_role) OR 
  has_role(auth.uid(), 'S4'::app_role)
);