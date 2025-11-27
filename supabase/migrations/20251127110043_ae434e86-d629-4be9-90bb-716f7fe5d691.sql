-- Fix audit logging: Add INSERT policy for audit_logs table
-- This allows the audit trigger function to write logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs 
FOR INSERT
TO authenticated
WITH CHECK (true);