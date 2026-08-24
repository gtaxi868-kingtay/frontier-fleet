-- Document capture: S4/S4_ADMIN photograph a document, an edge function reads it
-- with a vision model and extracts text/fields, and S4 approves before it becomes
-- visible to everyone else in the battalion.

CREATE TABLE public.document_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  storage_path TEXT NOT NULL,
  captured_by UUID NOT NULL REFERENCES public.profiles(id),
  unit_id UUID REFERENCES public.units(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'done', 'failed')),
  extracted_text TEXT,
  extracted_fields JSONB,
  extraction_error TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_captures_status ON public.document_captures(status);
CREATE INDEX idx_document_captures_captured_by ON public.document_captures(captured_by);

ALTER TABLE public.document_captures ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_document_captures_updated_at
BEFORE UPDATE ON public.document_captures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- S4 and S4_ADMIN can capture documents
CREATE POLICY "S4 staff can insert document captures"
ON public.document_captures FOR INSERT
TO authenticated
WITH CHECK (
  captured_by = auth.uid()
  AND (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role))
);

-- Everyone can see approved documents; approvers and the original capturer can
-- also see pending/rejected ones.
CREATE POLICY "Approved documents are visible to everyone"
ON public.document_captures FOR SELECT
TO authenticated
USING (
  status = 'approved'
  OR captured_by = auth.uid()
  OR has_role(auth.uid(), 'S4'::app_role)
  OR has_role(auth.uid(), 'S4_ADMIN'::app_role)
  OR has_role(auth.uid(), 'CO'::app_role)
);

-- Only S4 approves/rejects
CREATE POLICY "S4 can review document captures"
ON public.document_captures FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'S4'::app_role))
WITH CHECK (has_role(auth.uid(), 'S4'::app_role));

-- Audit trail + change-notice, same pattern as every other inventory-adjacent table
CREATE TRIGGER audit_document_captures_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.document_captures
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER notify_s4_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.document_captures
FOR EACH ROW EXECUTE FUNCTION public.notify_s4_change();

-- Notify S4 the moment a new document is captured and awaiting review.
CREATE OR REPLACE FUNCTION public.notify_new_document_capture()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.alerts (message, priority, sender_role, recipient_role, unit_id, alert_type, related_item_id, related_item_type, action_required)
  VALUES (
    format('New document captured: %s — awaiting approval', NEW.title),
    'Medium', 'S4_ADMIN', 'S4', NEW.unit_id, 'document_pending', NEW.id, 'document_captures', true
  );
  RETURN NEW;
END;
$function$;

CREATE TRIGGER notify_new_document_capture_trigger
AFTER INSERT ON public.document_captures
FOR EACH ROW EXECUTE FUNCTION public.notify_new_document_capture();

-- ---------------------------------------------------------------------------
-- Storage bucket for the captured photos. Private: access is gated by the
-- document_captures row's status/role via the policies below, not a public URL.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('document-captures', 'document-captures', false, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "S4 staff can upload document capture photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'document-captures'
  AND (has_role(auth.uid(), 'S4'::app_role) OR has_role(auth.uid(), 'S4_ADMIN'::app_role))
  AND (storage.foldername(name))[1] = auth.uid()::text
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.document_captures;

CREATE POLICY "Document capture photos follow the row's visibility"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'document-captures'
  AND EXISTS (
    SELECT 1 FROM public.document_captures dc
    WHERE dc.storage_path = storage.objects.name
      AND (
        dc.status = 'approved'
        OR dc.captured_by = auth.uid()
        OR has_role(auth.uid(), 'S4'::app_role)
        OR has_role(auth.uid(), 'S4_ADMIN'::app_role)
        OR has_role(auth.uid(), 'CO'::app_role)
      )
  )
);
