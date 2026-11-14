-- Family #30: permitir a las familias marcar incidencias como vistas y responder/firmar,
-- bloqueando la modificación de columnas reservadas al personal del centro.

DROP POLICY IF EXISTS incidents_update_parent ON public.incidents;
CREATE POLICY incidents_update_parent ON public.incidents
  FOR UPDATE TO authenticated
  USING (
    public.current_user_active()
    AND public.current_user_role() = 'parent'
    AND private.current_user_can_access_child(child_id)
  )
  WITH CHECK (
    public.current_user_active()
    AND public.current_user_role() = 'parent'
    AND private.current_user_can_access_child(child_id)
  );

CREATE OR REPLACE FUNCTION private.incidents_guard_parent_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF public.current_user_role() = 'parent' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.child_id IS DISTINCT FROM OLD.child_id
      OR NEW.date IS DISTINCT FROM OLD.date
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
      OR NEW.monitor_id IS DISTINCT FROM OLD.monitor_id
      OR NEW.reviewed IS DISTINCT FROM OLD.reviewed
      OR NEW.requires_family_signature IS DISTINCT FROM OLD.requires_family_signature
      OR NEW.send_notification IS DISTINCT FROM OLD.send_notification
      OR NEW.monitor_validated IS DISTINCT FROM OLD.monitor_validated
    THEN
      RAISE EXCEPTION 'Parents can only update family_seen, family_response and family_responded_at on incidents'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS incidents_guard_parent_update ON public.incidents;
CREATE TRIGGER incidents_guard_parent_update
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION private.incidents_guard_parent_update();
