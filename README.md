# SaidCoach Platform Enhancements

Este repositorio contiene el sitio web de SaidCoach (Next.js + App Router) junto con la nueva funcionalidad de competencias basada en Supabase y un contador de sentadillas con visión computacional.

## Contenido principal

- `src/app/**/*.tsx`: páginas, layouts y rutas API implementadas con el App Router de Next.js.
- `src/components/*`: componentes de UI compartidos (Navbar, Footer, layouts).
- `src/lib/supabase/*`: utilidades para crear clientes de Supabase en navegador, servidor y modo service.
- `src/providers/SupabaseProvider.tsx`: proveedor React que expone el cliente, maneja sesiones y sincroniza cookies.
- `public/squat-counter/*`: aplicación web estática (HTML/CSS/JS) del contador de sentadillas.
- `.env.local`: variables de entorno (no se versiona; copiar desde `.env.local.example`).

## Supabase

1. Crear un proyecto en Supabase y anotar:
   - Project URL (`https://<project>.supabase.co`)
   - `anon` key y `service_role` key.
2. En el SQL editor ejecutar:
   ```sql
   create table squat_sessions (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id) on delete cascade,
     reps integer not null,
     recorded_at timestamptz not null default now()
   );

  create index squat_sessions_user_id_recorded_at_idx
     on squat_sessions (user_id, recorded_at desc);

   create or replace function get_weekly_squat_leaderboard()
   returns table (
     user_id uuid,
     total_reps integer
   )
   language sql
   as $$
   select
     user_id,
     sum(reps) as total_reps
   from squat_sessions
   where recorded_at >= now() - interval '7 days'
   group by user_id
   order by total_reps desc;
   $$;

   alter table squat_sessions enable row level security;

   create policy "Users insert own sessions"
   on squat_sessions
   for insert
   with check (auth.uid() = user_id);

   create policy "Leaderboard readable"
   on squat_sessions
   for select
   using (true);
   ```
3. Configurar URLs en *Authentication → URL Configuration*:
   - Site URL: `https://www.saidcoach.com`
   - Additional redirect URLs: `https://www.saidcoach.com/auth/callback`, `http://localhost:3000`, `http://localhost:3000/auth/callback`

## Variables de entorno

Crear `.env.local` (en producción añadir las mismas variables en Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Páginas y rutas clave

| Ruta | Descripción |
| --- | --- |
| `/login` | Formulario para registro e inicio de sesión (Supabase Auth). |
| `/competencia` | Leaderboard semanal, acciones rápidas y enlace al contador. |
| `/portal-alumnos` | Embebido del portal PT Distinction. |
| `/guia-nutricional` | Formulario de Google incrustado. |
| `/api/session` | Devuelve usuario autenticado (usado por el contador). |
| `/api/squats` | `POST` registra repeticiones; `GET` devuelve leaderboard enriquecido con emails. |
| `/auth/callback` | Sincroniza eventos de sesión cliente → servidor. |
| `/squat-counter/index.html` | Aplicación estática del contador de sentadillas. |

### Contador de sentadillas (public/squat-counter)

- Usa MediaPipe Pose para detectar ángulo cadera–rodilla–tobillo.
- Repite una rep cuando el ángulo baja de 125° y después sube por encima de 170°.
- Muestra estado visual, beep, e intenta sincronizar reps con `/api/squats`.
- Si no hay sesión activa, informa que las reps quedarán pendientes.

## Desarrollo local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

Para usar el contador local, visita: `http://localhost:3000/squat-counter/index.html` (HTTPS no es necesario porque está en localhost).

## Deploy

1. Hacer commit y push a `main`.
2. En Vercel, definir las variables de entorno y hacer redeploy.
3. Probar rutas `/login`, `/competencia`, `/squat-counter/index.html` en producción (se necesita HTTPS para acceso a cámara).

## Próximos pasos sugeridos

- Afinar el reconocimiento para otras variantes (por ejemplo vuelos laterales u otros ejercicios).
- Enriquecer el leaderboard con nombres visibles (guardar `display_name` por usuario).
- Añadir jobs programados en Supabase o Vercel para cerrar semanas y enviar resultados.
