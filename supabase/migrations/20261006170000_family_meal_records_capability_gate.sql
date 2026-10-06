-- Family #8: gate de registros de comidas por capacidad efectiva del aula del hijo.
-- Los registros históricos se conservan; solo se limita la lectura directa cuando está deshabilitado.
-- Resolución: override del aula si existe, si no valor del colegio, si no habilitado por defecto.

CREATE OR REPLACE FUNCTION private.family_meal_records_enabled_for_child(p_child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (
      SELECT o.enabled
        FROM public.class_capability_overrides o
        JOIN public.children ch ON ch.class_id = o.class_id
       WHERE ch.id = p_child_id
         AND o.capability = 'family_meal_records'
    ),
    (
      SELECT s.enabled
        FROM public.school_capabilities s
        JOIN public.children ch ON ch.id = p_child_id
        JOIN public.classes c ON c.id = ch.class_id
       WHERE s.school_id = c.school_id
         AND s.capability = 'family_meal_records'
    ),
    (
      SELECT k.default_enabled
        FROM public.capability_catalog k
       WHERE k.capability = 'family_meal_records'
    ),
    true
  )
$function$;

REVOKE ALL ON FUNCTION private.family_meal_records_enabled_for_child(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.family_meal_records_enabled_for_child(uuid) TO authenticated;

-- Familias solo leen registros del hijo autorizado cuando la capacidad efectiva está habilitada.
DROP POLICY IF EXISTS meal_records_select_parent ON public.meal_records;
CREATE POLICY meal_records_select_parent ON public.meal_records
  FOR SELECT TO authenticated
  USING (
    public.current_user_active()
    AND public.current_user_role() = 'parent'
    AND private.current_user_can_access_child(child_id)
    AND private.family_meal_records_enabled_for_child(child_id)
  );

-- Las familias necesitan leer los tipos de comida de su colegio para el join de registros.
DROP POLICY IF EXISTS meal_types_select_parent ON public.meal_types;
CREATE POLICY meal_types_select_parent ON public.meal_types
  FOR SELECT TO authenticated
  USING (
    public.current_user_active()
    AND public.current_user_role() = 'parent'
    AND EXISTS (
      SELECT 1
        FROM public.parents_children pc
        JOIN public.children ch ON ch.id = pc.child_id
        JOIN public.classes cl ON cl.id = ch.class_id
       WHERE pc.parent_id = public.current_user_id()
         AND cl.school_id = meal_types.school_id
    )
  );
