-- Small, safe aggregate for the pre-login screen. Returns only counts/a
-- percentage, no row data, so it's fine to expose to anon (nothing else in
-- this app is anon-readable; every other table stays fully RLS-gated).
CREATE OR REPLACE FUNCTION public.get_public_login_stats()
RETURNS TABLE(tracked_assets bigint, squadrons bigint, arms_reconciled_pct numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM weapons)
    + (SELECT count(*) FROM tools)
    + (SELECT count(*) FROM vehicles)
    + (SELECT count(*) FROM engineer_equipment)
    + (SELECT count(*) FROM plant_machinery)
    + (SELECT count(*) FROM mechanics_tools)
    + (SELECT count(*) FROM ppe)
    + (SELECT count(*) FROM uniforms)
    + (SELECT count(*) FROM explosives)
    + (SELECT count(*) FROM general_inventory)
    + (SELECT count(*) FROM room_inventory) AS tracked_assets,
    (SELECT count(*) FROM units) AS squadrons,
    COALESCE(
      ROUND(
        100.0 * (SELECT count(*) FROM weapons WHERE serviceable = true)
        / NULLIF((SELECT count(*) FROM weapons), 0)
      , 1),
      0
    ) AS arms_reconciled_pct;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_login_stats() TO anon, authenticated;
