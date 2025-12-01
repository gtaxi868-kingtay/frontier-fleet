-- Exchange Execution RPC Function
-- Provides atomic transaction for completing monthly exchanges
-- Marks old items as returned and links new items issued

CREATE OR REPLACE FUNCTION public.execute_clothing_exchange(
  p_exchange_id UUID,
  p_items_to_return UUID[],
  p_new_issue_ids UUID[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_return_date DATE;
  v_exchange_record RECORD;
  v_returned_count INTEGER;
  v_error_message TEXT;
  v_current_issued UUID[];
BEGIN
  -- Get current date for return_date
  v_return_date := CURRENT_DATE;

  -- Get exchange record for validation
  SELECT * INTO v_exchange_record
  FROM public.clothing_exchanges
  WHERE id = p_exchange_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Exchange record not found',
      'items_returned', 0,
      'items_issued', '[]'::jsonb
    );
  END IF;

  -- Validate exchange is approved
  IF NOT v_exchange_record.qm_approved THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Exchange must be approved before execution',
      'items_returned', 0,
      'items_issued', '[]'::jsonb
    );
  END IF;

  -- Validate items to return are actually issued and not already returned
  SELECT COUNT(*) INTO v_returned_count
  FROM public.clothing_equipment_issues
  WHERE id = ANY(p_items_to_return)
    AND return_date IS NOT NULL;

  IF v_returned_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Some items (%s) have already been returned', v_returned_count),
      'items_returned', 0,
      'items_issued', '[]'::jsonb
    );
  END IF;

  BEGIN
    -- Step 1: Mark items as returned (atomic within transaction)
    UPDATE public.clothing_equipment_issues
    SET 
      return_date = v_return_date,
      condition_on_return = 'Exchanged',
      notes = COALESCE(notes, '') || E'\n' || format('Returned as part of exchange %s on %s', p_exchange_id, v_return_date)
    WHERE id = ANY(p_items_to_return)
      AND return_date IS NULL;

    GET DIAGNOSTICS v_returned_count = ROW_COUNT;

    -- Step 2: Link new items to exchange (if any)
    IF p_new_issue_ids IS NOT NULL AND array_length(p_new_issue_ids, 1) > 0 THEN
      -- Get current items_issued array
      v_current_issued := COALESCE(v_exchange_record.items_issued, ARRAY[]::UUID[]);
      
      -- Merge new items (avoid duplicates)
      v_current_issued := array(SELECT DISTINCT unnest(v_current_issued || p_new_issue_ids));
      
      UPDATE public.clothing_exchanges
      SET 
        items_issued = v_current_issued,
        quantity_exchanged = array_length(v_current_issued, 1),
        updated_at = NOW()
      WHERE id = p_exchange_id;
    END IF;

    -- Return success
    RETURN json_build_object(
      'success', true,
      'error', NULL,
      'items_returned', v_returned_count,
      'items_issued', COALESCE(to_jsonb(p_new_issue_ids), '[]'::jsonb)
    );

  EXCEPTION WHEN OTHERS THEN
    -- Rollback will happen automatically
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RETURN json_build_object(
      'success', false,
      'error', v_error_message,
      'items_returned', 0,
      'items_issued', '[]'::jsonb
    );
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_clothing_exchange(UUID, UUID[], UUID[]) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.execute_clothing_exchange IS 'Atomically executes a clothing exchange: marks old items as returned and links new items issued. Requires exchange to be QM approved.';

