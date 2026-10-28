-- ============================================================================
-- VesperFlix — Script inicial de Base de Datos
-- ============================================================================
-- Plataforma   : Supabase (PostgreSQL 15+)
-- Archivo      : supabase/schema.sql
-- Propósito    : Esquema relacional, seguridad RLS, índices, triggers y seeds
-- Uso          : Copiar y pegar íntegramente en el SQL Editor de Supabase
-- Versión      : 1.0.0
-- ============================================================================
-- ÍNDICE:
--   1. Extensiones
--   2. Tablas (profiles, movies, genres, movie_genres, movie_sources, favorites, watch_history)
--   3. Funciones (is_admin, set_updated_at, handle_new_user, prevent_role_escalation)
--   4. Triggers
--   5. Índices de rendimiento
--   6. Row Level Security (RLS)
--   7. Políticas de acceso
--   8. Permisos (Grants)
--   9. Seed de datos (Géneros TMDB)
--  10. Verificación
--  11. Realtime (Supabase Realtime)
-- ============================================================================
create extension if not exists pg_trgm;   -- búsqueda difusa
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- 2. TABLAS ------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profiles_display_name_trim check (display_name is null or length(btrim(display_name))>0)
);
comment on table public.profiles is 'Perfiles 1:1 con auth.users';
comment on column public.profiles.role is 'user (default) | admin';

create table if not exists public.movies (
  id            uuid primary key default gen_random_uuid(),
  tmdb_id       bigint not null unique,
  title         text not null,
  overview      text,
  poster_path   text,
  backdrop_path text,
  release_date  date,
  vote_average  numeric(3,1) not null default 0 check (vote_average between 0 and 10),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint movies_title_not_blank check (length(btrim(title))>0)
);
comment on table public.movies is 'Catálogo (metadatos TMDB)';
comment on column public.movies.tmdb_id is 'ID original TMDB';

create table if not exists public.genres (
  id         uuid primary key default gen_random_uuid(),
  tmdb_id    bigint not null unique,
  name       text not null unique,
  created_at timestamptz not null default now(),
  constraint genres_name_not_blank check (length(btrim(name))>0)
);
comment on table public.genres is 'Géneros TMDB normalizados';

create table if not exists public.movie_genres (
  movie_id uuid not null references public.movies(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (movie_id, genre_id)
);
comment on table public.movie_genres is 'Relación M:N películas-géneros';

create table if not exists public.movie_sources (
  id         uuid primary key default gen_random_uuid(),
  movie_id   uuid not null references public.movies(id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('youtube','embed')),
  url        text not null,
  quality    text not null default 'auto' check (quality in ('4k','1080p','720p','480p','360p','auto')),
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  constraint movie_sources_url_not_blank check (length(btrim(url))>0),
  constraint movie_sources_name_not_blank check (length(btrim(name))>0)
);
comment on table public.movie_sources is 'Fuentes: youtube (trailer) o embed (vidsrc.to/vidsrc.xyz)';
comment on column public.movie_sources.type is 'youtube|embed';

create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  movie_id   uuid not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);
comment on table public.favorites is 'Favoritos por usuario';

create table if not exists public.watch_history (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  movie_id              uuid not null references public.movies(id) on delete cascade,
  last_position_seconds integer not null default 0 check (last_position_seconds>=0),
  duration_seconds      integer not null default 0 check (duration_seconds>=0),
  updated_at            timestamptz not null default now(),
  unique (user_id, movie_id),
  check (duration_seconds=0 or last_position_seconds<=duration_seconds)
);
comment on table public.watch_history is 'Progreso para reanudar ("Continuar Viendo")';

-- 3. FUNCIONES ----------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path=''
as $$ select exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'); $$;
comment on function public.is_admin() is 'Evalúa rol admin (SECURITY DEFINER, evita recursión RLS)';

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at:=now(); return new; end; $$;
comment on function public.set_updated_at() is 'Mantiene updated_at';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email,''),'@',1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;
comment on function public.handle_new_user() is 'Crea perfil tras signup';

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.role is distinct from old.role then
    if current_user not in ('postgres','service_role','supabase_admin') then
      raise exception 'No tienes permiso para modificar el campo "role"';
    end if;
  end if;
  return new;
end; $$;
comment on function public.prevent_role_escalation() is 'Protege contra auto-elevación de rol';

-- 4. TRIGGERS ----------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists protect_profiles_role on public.profiles;
create trigger protect_profiles_role before update on public.profiles for each row execute function public.prevent_role_escalation();

drop trigger if exists set_movies_updated_at on public.movies;
create trigger set_movies_updated_at before update on public.movies for each row execute function public.set_updated_at();

drop trigger if exists set_watch_history_updated_at on public.watch_history;
create trigger set_watch_history_updated_at before update on public.watch_history for each row execute function public.set_updated_at();

-- 5. ÍNDICES -----------------------------------------------------------------
create index if not exists movies_title_trgm_idx on public.movies using gin (title gin_trgm_ops);
create index if not exists movies_release_date_idx on public.movies (release_date desc nulls last);
create index if not exists movies_vote_average_idx on public.movies (vote_average desc);
create index if not exists movies_tmdb_id_idx on public.movies (tmdb_id);
create index if not exists movie_genres_genre_id_idx on public.movie_genres (genre_id);
create index if not exists movie_genres_movie_id_idx on public.movie_genres (movie_id);
create index if not exists movie_sources_movie_id_idx on public.movie_sources (movie_id, sort_order, is_active desc);
create index if not exists favorites_user_created_idx on public.favorites (user_id, created_at desc);
create index if not exists favorites_movie_id_idx on public.favorites (movie_id);
create index if not exists watch_history_user_updated_idx on public.watch_history (user_id, updated_at desc);
create index if not exists watch_history_movie_id_idx on public.watch_history (movie_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- 6. RLS ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.genres enable row level security;
alter table public.movie_genres enable row level security;
alter table public.movie_sources enable row level security;
alter table public.favorites enable row level security;
alter table public.watch_history enable row level security;

-- 7. POLÍTICAS ---------------------------------------------------------------
create policy "Profiles are publicly readable" on public.profiles for select to public using (true);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid()=id and role='user');
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);

create policy "Movies catalog is publicly readable" on public.movies for select to public using (true);
create policy "Admins can manage movies" on public.movies for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Genres are publicly readable" on public.genres for select to public using (true);
create policy "Admins can manage genres" on public.genres for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Movie genres are publicly readable" on public.movie_genres for select to public using (true);
create policy "Admins can manage movie genres" on public.movie_genres for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Movie sources are publicly readable" on public.movie_sources for select to public using (is_active or public.is_admin());
create policy "Admins can manage movie sources" on public.movie_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Users can read their own favorites" on public.favorites for select to authenticated using (auth.uid()=user_id);
create policy "Users can insert their own favorites" on public.favorites for insert to authenticated with check (auth.uid()=user_id);
create policy "Users can update their own favorites" on public.favorites for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users can delete their own favorites" on public.favorites for delete to authenticated using (auth.uid()=user_id);

create policy "Users can read their own watch history" on public.watch_history for select to authenticated using (auth.uid()=user_id);
create policy "Users can insert their own watch history" on public.watch_history for insert to authenticated with check (auth.uid()=user_id);
create policy "Users can update their own watch history" on public.watch_history for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users can delete their own watch history" on public.watch_history for delete to authenticated using (auth.uid()=user_id);

-- 8. GRANTS ------------------------------------------------------------------
grant select on table public.profiles, public.movies, public.genres, public.movie_genres, public.movie_sources to anon, authenticated;
grant select, insert, update, delete on table public.favorites, public.watch_history to authenticated;
grant select, insert, update, delete on table public.movies, public.genres, public.movie_genres, public.movie_sources to authenticated;
grant update on table public.profiles to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 9. SEED --------------------------------------------------------------------
insert into public.genres (tmdb_id, name) values
  (28,'Action'),(12,'Adventure'),(16,'Animation'),(35,'Comedy'),(80,'Crime'),
  (99,'Documentary'),(18,'Drama'),(10751,'Family'),(14,'Fantasy'),(36,'History'),
  (27,'Horror'),(10402,'Music'),(9648,'Mystery'),(10749,'Romance'),(878,'Science Fiction'),
  (10770,'TV Movie'),(53,'Thriller'),(10752,'War'),(37,'Western')
on conflict (tmdb_id) do update set name=excluded.name where public.genres.name is distinct from excluded.name;

-- 10-11. VERIF/REALTIME ------------------------------------------------------
-- Promocionar admin desde SQL Editor (rol postgres): UPDATE public.profiles SET role='admin' WHERE id='UUID';
do $$ begin
  begin alter publication supabase_realtime add table public.movies; exception when duplicate_table or undefined_object then null; end;
  begin alter publication supabase_realtime add table public.movie_sources; exception when duplicate_table or undefined_object then null; end;
  begin alter publication supabase_realtime add table public.genres; exception when duplicate_table or undefined_object then null; end;
  begin alter publication supabase_realtime add table public.movie_genres; exception when duplicate_table or undefined_object then null; end;
end; $$;
-- Fin
