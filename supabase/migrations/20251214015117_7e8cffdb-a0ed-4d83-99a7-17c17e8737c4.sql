-- Add service_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS service_number TEXT;