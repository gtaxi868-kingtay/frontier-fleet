-- Add rack_number column to weapons table
ALTER TABLE public.weapons 
ADD COLUMN rack_number text;