-- Enable real-time updates for all inventory tables
-- This allows all users to see changes immediately when any role updates data

-- Set replica identity to FULL for complete row data during updates
ALTER TABLE public.weapons REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
ALTER TABLE public.tools REPLICA IDENTITY FULL;
ALTER TABLE public.engineer_equipment REPLICA IDENTITY FULL;
ALTER TABLE public.plant_machinery REPLICA IDENTITY FULL;
ALTER TABLE public.mechanics_tools REPLICA IDENTITY FULL;
ALTER TABLE public.mt_facilities REPLICA IDENTITY FULL;
ALTER TABLE public.ppe REPLICA IDENTITY FULL;
ALTER TABLE public.uniforms REPLICA IDENTITY FULL;
ALTER TABLE public.explosives REPLICA IDENTITY FULL;
ALTER TABLE public.facilities REPLICA IDENTITY FULL;
ALTER TABLE public.works_materials REPLICA IDENTITY FULL;
ALTER TABLE public.general_inventory REPLICA IDENTITY FULL;
ALTER TABLE public.room_inventory REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication (alerts already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.weapons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tools;
ALTER PUBLICATION supabase_realtime ADD TABLE public.engineer_equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plant_machinery;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mechanics_tools;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mt_facilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ppe;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uniforms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.explosives;
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.works_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.general_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;