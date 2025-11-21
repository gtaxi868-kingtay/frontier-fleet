-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Command staff can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'CO'::app_role) OR 
  has_role(auth.uid(), 'S1'::app_role) OR 
  has_role(auth.uid(), 'S4'::app_role) OR 
  has_role(auth.uid(), 'S4_ADMIN'::app_role)
);

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields TEXT[] := '{}';
  old_json JSONB;
  new_json JSONB;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_json := to_jsonb(OLD);
    new_json := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_json := NULL;
    new_json := to_jsonb(NEW);
  ELSE -- UPDATE
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
    
    -- Identify changed fields
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(new_json)
    WHERE new_json->key IS DISTINCT FROM old_json->key;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_json,
    new_json,
    changed_fields
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to all inventory tables
CREATE TRIGGER audit_weapons
AFTER INSERT OR UPDATE OR DELETE ON public.weapons
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_vehicles
AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_tools
AFTER INSERT OR UPDATE OR DELETE ON public.tools
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_engineer_equipment
AFTER INSERT OR UPDATE OR DELETE ON public.engineer_equipment
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_plant_machinery
AFTER INSERT OR UPDATE OR DELETE ON public.plant_machinery
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_mechanics_tools
AFTER INSERT OR UPDATE OR DELETE ON public.mechanics_tools
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_mt_facilities
AFTER INSERT OR UPDATE OR DELETE ON public.mt_facilities
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_ppe
AFTER INSERT OR UPDATE OR DELETE ON public.ppe
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_uniforms
AFTER INSERT OR UPDATE OR DELETE ON public.uniforms
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_explosives
AFTER INSERT OR UPDATE OR DELETE ON public.explosives
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_facilities
AFTER INSERT OR UPDATE OR DELETE ON public.facilities
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_works_materials
AFTER INSERT OR UPDATE OR DELETE ON public.works_materials
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_general_inventory
AFTER INSERT OR UPDATE OR DELETE ON public.general_inventory
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_room_inventory
AFTER INSERT OR UPDATE OR DELETE ON public.room_inventory
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();