-- Tabla base de avisos de familias hacia el centro (especial, dieta, fuera de hora; ausencia añadida en 20261006160000).

DO $$
BEGIN
  CREATE TYPE public.family_request_type AS ENUM (
    'special_menu',
    'dieta',
    'fuera_de_hora'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.contact_method AS ENUM (
    'email',
    'telefono',
    'otro'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.family_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  request_type public.family_request_type NOT NULL,
  date date NOT NULL,
  message text NOT NULL,
  contact_method public.contact_method,
  contact_detail text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT family_requests_message_length_chk
    CHECK (char_length(btrim(message)) BETWEEN 1 AND 1000),
  CONSTRAINT family_requests_contact_detail_length_chk
    CHECK (contact_detail IS NULL OR char_length(contact_detail) <= 200),
  CONSTRAINT family_requests_contact_consistency_chk
    CHECK (
      (contact_method IS NULL AND contact_detail IS NULL)
      OR (contact_method IS NOT NULL AND char_length(btrim(coalesce(contact_detail, ''))) >= 1)
    ),
  CONSTRAINT family_requests_special_menu_contact_chk
    CHECK (
      request_type <> 'special_menu'
      OR (contact_method IS NOT NULL AND char_length(btrim(coalesce(contact_detail, ''))) >= 1)
    )
);

CREATE INDEX IF NOT EXISTS family_requests_child_id_idx
  ON public.family_requests (child_id);

CREATE UNIQUE INDEX IF NOT EXISTS family_requests_dieta_child_date_uidx
  ON public.family_requests (child_id, date)
  WHERE request_type = 'dieta';

CREATE UNIQUE INDEX IF NOT EXISTS family_requests_fuera_de_hora_uidx
  ON public.family_requests (child_id, date, (payload->>'direction'))
  WHERE request_type = 'fuera_de_hora';

ALTER TABLE public.family_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_requests_insert_parent ON public.family_requests;
CREATE POLICY family_requests_insert_parent ON public.family_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_active()
    AND public.current_user_role() = 'parent'
    AND private.current_user_can_access_child(child_id)
  );
