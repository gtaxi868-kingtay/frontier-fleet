-- Add audit triggers for key inventory tables if they do not already exist
DO $$
BEGIN
  -- Weapons
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_weapons_trigger'
  ) THEN
    CREATE TRIGGER audit_weapons_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.weapons
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Vehicles
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_vehicles_trigger'
  ) THEN
    CREATE TRIGGER audit_vehicles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Tools
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_tools_trigger'
  ) THEN
    CREATE TRIGGER audit_tools_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tools
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Engineer equipment
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_engineer_equipment_trigger'
  ) THEN
    CREATE TRIGGER audit_engineer_equipment_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.engineer_equipment
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Plant machinery
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_plant_machinery_trigger'
  ) THEN
    CREATE TRIGGER audit_plant_machinery_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.plant_machinery
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Mechanics tools
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_mechanics_tools_trigger'
  ) THEN
    CREATE TRIGGER audit_mechanics_tools_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.mechanics_tools
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- MT facilities
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_mt_facilities_trigger'
  ) THEN
    CREATE TRIGGER audit_mt_facilities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.mt_facilities
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- PPE
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_ppe_trigger'
  ) THEN
    CREATE TRIGGER audit_ppe_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ppe
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Uniforms
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_uniforms_trigger'
  ) THEN
    CREATE TRIGGER audit_uniforms_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.uniforms
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Explosives
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_explosives_trigger'
  ) THEN
    CREATE TRIGGER audit_explosives_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.explosives
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Facilities
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_facilities_trigger'
  ) THEN
    CREATE TRIGGER audit_facilities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.facilities
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Works materials
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_works_materials_trigger'
  ) THEN
    CREATE TRIGGER audit_works_materials_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.works_materials
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- General inventory
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_general_inventory_trigger'
  ) THEN
    CREATE TRIGGER audit_general_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.general_inventory
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;

  -- Room inventory
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_room_inventory_trigger'
  ) THEN
    CREATE TRIGGER audit_room_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.room_inventory
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;
END $$;