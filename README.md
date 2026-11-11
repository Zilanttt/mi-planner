# Mi Planner

Planificador personal (tareas, horario, hábitos, metas, diario y bloques de foco) que funciona en el compu y en el celu, sin depender de ninguna cuenta de IA.

- **App:** página estática (`index.html`) instalable como app (PWA).
- **Datos y sincronización:** Supabase (tabla `planner_docs`, cada usuario solo ve sus filas).
- **"Dile qué hacer":** dictado del navegador + Gemini API (clave propia, se pega en Ajustes).

## Configuración
1. Pon tu Project URL y anon key de Supabase en `config.js`.
2. En Supabase, crea la tabla con el SQL de abajo.
3. Publica con GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

```sql
create table public.planner_docs (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, name)
);
alter table public.planner_docs enable row level security;
create policy "solo mis datos" on public.planner_docs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Al cambiar archivos, sube el número de `CACHE` en `sw.js` para que el celu tome la versión nueva.
