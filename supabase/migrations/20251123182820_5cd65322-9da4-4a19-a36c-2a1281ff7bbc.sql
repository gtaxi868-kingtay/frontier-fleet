-- Add audit triggers to all inventory tables for tracking changes

-- Create audit trigger for weapons table
CREATE TRIGGER audit_weapons_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.weapons
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for vehicles table
CREATE TRIGGER audit_vehicles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for tools table
CREATE TRIGGER audit_tools_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for engineer_equipment table
CREATE TRIGGER audit_engineer_equipment_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.engineer_equipment
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for plant_machinery table
CREATE TRIGGER audit_plant_machinery_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.plant_machinery
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for mechanics_tools table
CREATE TRIGGER audit_mechanics_tools_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.mechanics_tools
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for mt_facilities table
CREATE TRIGGER audit_mt_facilities_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.mt_facilities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for ppe table
CREATE TRIGGER audit_ppe_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.ppe
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for uniforms table
CREATE TRIGGER audit_uniforms_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.uniforms
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for explosives table
CREATE TRIGGER audit_explosives_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.explosives
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for facilities table
CREATE TRIGGER audit_facilities_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for works_materials table
CREATE TRIGGER audit_works_materials_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.works_materials
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for general_inventory table
CREATE TRIGGER audit_general_inventory_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.general_inventory
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Create audit trigger for room_inventory table
CREATE TRIGGER audit_room_inventory_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.room_inventory
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();