-- Closes gaps found in the transaction/audit trail and notification system:
--
-- 1. `notify_s4_change()` (change-notice alerts) was already applied live to nearly
--    every inventory table, but was never captured in a committed migration — a
--    `supabase db reset` would silently lose it. This migration records the exact
--    function that is already running in production and re-applies it to the
--    handful of inventory tables that were missing it (fuel/POL, equipment kits,
--    weapon physical checks).
-- 2. The generic `audit_trigger_func()` (full old/new value audit log) was only ever
--    wired up to the original 13 inventory tables. Every table added since
--    (MT, Workshop, POL, QM tracking/books) has no audit trail at all. Backfilled here.
-- 3. Submitting an inventory request never notified anyone with approval authority —
--    S4/CO only found out by manually opening the Inventory Requests page. Added a
--    trigger that raises a `request_pending` alert to S4 and CO on submission.
-- 4. Low stock was only ever visible by opening Analytics; nothing pushed it to the
--    notification bell. Added a trigger that raises a `low_stock` alert to S4 the
--    moment an item's on-hand quantity drops to or below its reorder level.

-- ---------------------------------------------------------------------------
-- 1. Record the live `notify_s4_change` function (already running in prod) and
--    apply it to the inventory tables that don't have it yet.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_s4_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_id uuid := auth.uid();
  actor_is_s4 boolean;
  actor_is_s4_admin boolean;
  action_desc text;
  affected_id uuid;
BEGIN
  IF actor_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  actor_is_s4 := has_role(actor_id, 'S4'::app_role);
  actor_is_s4_admin := has_role(actor_id, 'S4_ADMIN'::app_role);

  IF NOT (actor_is_s4 OR actor_is_s4_admin) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  action_desc := CASE TG_OP
    WHEN 'INSERT' THEN 'added a record to'
    WHEN 'UPDATE' THEN 'updated a record in'
    WHEN 'DELETE' THEN 'deleted a record from'
  END;

  affected_id := COALESCE(NEW.id, OLD.id);

  IF actor_is_s4 THEN
    INSERT INTO public.alerts (message, sender_role, recipient_role, alert_type, related_item_id, related_item_type, action_required)
    VALUES
      (format('S4 %s %s', action_desc, TG_TABLE_NAME), 'S4', 'CO', 'change_notice', affected_id, TG_TABLE_NAME, false),
      (format('S4 %s %s', action_desc, TG_TABLE_NAME), 'S4', 'S1', 'change_notice', affected_id, TG_TABLE_NAME, false);
  ELSIF actor_is_s4_admin THEN
    INSERT INTO public.alerts (message, sender_role, recipient_role, alert_type, related_item_id, related_item_type, action_required)
    VALUES
      (format('S4_ADMIN %s %s — needs confirmation', action_desc, TG_TABLE_NAME), 'S4_ADMIN', 'S4', 'change_notice', affected_id, TG_TABLE_NAME, true);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fuel_tanks', 'fuel_transactions', 'tank_dips',
    'equipment_kits', 'equipment_kit_items',
    'weapon_physical_checks', 'weapon_physical_check_items'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'notify_s4_change_trigger'
        AND tgrelid = ('public.' || t)::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER notify_s4_change_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.notify_s4_change();',
        t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Backfill the full audit trail (audit_logs) to every inventory table that
--    was added after the original 13 and never got wired up.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mt_work_tickets', 'mt_driver_permits', 'mt_driver_tests', 'mt_vehicle_allocations',
    'mt_accidents', 'vehicle_inspections', 'mt_detail_sheets',
    'pol_accounts', 'pol_storage', 'jerrican_inventory', 'pol_transactions',
    'workshop_inspections', 'workshop_repairs', 'workshop_reports',
    'barracks_stores', 'barracks_stores_distribution',
    'clothing_equipment_scale', 'clothing_equipment_issues', 'clothing_exchanges',
    'kit_inspections', 'laundry_book', 'boot_book', 'tailor_book', 'bedding_book', 'repair_book',
    'inventory_items', 'uniform_sets',
    'fuel_tanks', 'fuel_transactions', 'tank_dips',
    'equipment_kits', 'equipment_kit_items',
    'weapon_physical_checks', 'weapon_physical_check_items'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'audit_' || t || '_trigger'
        AND tgrelid = ('public.' || t)::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();',
        'audit_' || t || '_trigger', t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Notify S4 and CO the moment an inventory request is submitted, so approvers
--    see it on the bell instead of having to remember to check the page.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_new_inventory_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.alerts (message, priority, sender_role, recipient_role, unit_id, alert_type, related_item_id, related_item_type, action_required)
  VALUES
    (
      format('New %s request: %s (qty %s) awaiting approval', NEW.request_type, COALESCE(NEW.item_name, NEW.item_type), NEW.quantity),
      'Medium', NEW.requester_role, 'S4', NEW.unit_id, 'request_pending', NEW.id, 'inventory_requests', true
    ),
    (
      format('New %s request: %s (qty %s) awaiting approval', NEW.request_type, COALESCE(NEW.item_name, NEW.item_type), NEW.quantity),
      'Medium', NEW.requester_role, 'CO', NEW.unit_id, 'request_pending', NEW.id, 'inventory_requests', true
    );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_new_inventory_request_trigger ON public.inventory_requests;
CREATE TRIGGER notify_new_inventory_request_trigger
AFTER INSERT ON public.inventory_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_new_inventory_request();

-- ---------------------------------------------------------------------------
-- 4. Notify S4 when an item's on-hand quantity crosses at or below its reorder
--    level. Fires only on the transition into low stock, not on every edit, so
--    it doesn't spam the bell while an item sits low.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  was_low boolean := false;
  is_low boolean;
BEGIN
  is_low := NEW.qty_on_hand <= NEW.reorder_level;

  IF TG_OP = 'UPDATE' THEN
    was_low := OLD.qty_on_hand <= OLD.reorder_level;
  END IF;

  IF is_low AND NOT was_low THEN
    INSERT INTO public.alerts (message, priority, sender_role, recipient_role, unit_id, alert_type, related_item_id, related_item_type, action_required)
    VALUES (
      format('%s (%s) is at or below reorder level: %s on hand, reorder at %s', NEW.item_name, NEW.item_id, NEW.qty_on_hand, NEW.reorder_level),
      'High', 'S4_ADMIN', 'S4', NEW.squadron_id, 'low_stock', NEW.id, 'general_inventory', false
    );
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_low_stock_trigger ON public.general_inventory;
CREATE TRIGGER notify_low_stock_trigger
AFTER INSERT OR UPDATE ON public.general_inventory
FOR EACH ROW EXECUTE FUNCTION public.notify_low_stock();
