-- Phase 1.1: Add MTO and WKSP_WO roles to app_role enum

-- Add MTO (Mechanical Transport Officer) role
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MTO' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'MTO';
  END IF;
END $$;

-- Add WKSP_WO (Workshop Warrant Officer) role
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WKSP_WO' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'WKSP_WO';
  END IF;
END $$;

