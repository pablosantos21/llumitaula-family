# Llum i Taula - Familia

Aplicación web móvil-first para familias de centros educativos gestionados con **Llum i Taula**. Permite consultar menús diarios y nocturnos, registros de comida, hábitos de alimentación, notificaciones e incidencias del centro, y enviar avisos (dieta especial, ausencia, menú especial y salidas fuera de hora).

## Requisitos

- Node.js 20+
- pnpm (o npm)
- Proyecto de Supabase configurado

## Configuración del entorno

1. Copia el archivo de ejemplo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Rellena en `.env` las credenciales públicas de tu proyecto Supabase:

   - `VITE_SUPABASE_URL`: URL del proyecto (`https://<project-ref>.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: clave pública `anon`

> Nota: Si las variables no están definidas, la aplicación arranca mostrando una advertencia en consola para facilitar tests locales y comprobaciones de build sin secretos.

## Instalación y scripts

```bash
npm install
npm run dev     # Servidor de desarrollo con Vite
npm run test    # Ejecuta la batería de tests unitarios con Vitest
npm run lint    # Comprueba reglas de ESLint y TypeScript
npm run build   # Compila TypeScript (tsc -b) y genera el bundle en dist/
npm run preview # Sirve el build generado localmente
```

## Base de datos y migraciones (Supabase)

Las migraciones SQL están en `supabase/migrations/`:

- `20261005090000_create_family_requests.sql`: tabla base `public.family_requests`, enums `family_request_type` y `contact_method`, restricciones, índices únicos parciales y política RLS para familias.
- `20261006160000_add_absence_to_family_request_type.sql`: añade `'ausencia'` al enum `family_request_type`.
- `20261006170000_family_meal_records_capability_gate.sql`: RLS de lectura para `meal_records` sujeta a capacidad efectiva.
- `20261006180000_family_incidents_response_and_seen.sql`: política y trigger para `family_seen` / `family_response` en `incidents`.
