-- Corporate wellness challenge schema, policies, and RPCs
-- Run this file in Supabase SQL editor or via supabase db push.

create extension if not exists "pgcrypto";

-- Helpers --------------------------------------------------------------------

create or replace function public.current_local_date(tz text default 'America/Santiago')
returns date
language sql
stable
as $$
  select (timezone(tz, now()))::date;
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core tables ----------------------------------------------------------------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  name text,
  age int,
  sex text,
  height_cm int,
  weight_kg int,
  activity_level text,
  goal text,
  food_preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  level int not null,
  start_date date not null,
  end_date date not null,
  duration_days int not null default 90,
  movement_goal int not null,
  photos_per_day int not null default 1,
  lessons_per_day int not null default 1,
  meditation_required boolean not null default true,
  gratitude_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_challenge (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table if not exists public.daily_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  date date not null,
  movement_reps int not null default 0,
  movement_points int not null default 0,
  movement_bonus_points int not null default 0,
  nutrition_photo_url text,
  nutrition_points int not null default 0,
  nutrition_bonus_points int not null default 0,
  lesson_completed boolean not null default false,
  lesson_points int not null default 0,
  meditation_completed boolean not null default false,
  meditation_points int not null default 0,
  gratitude_text text,
  gratitude_points int not null default 0,
  notes text,
  total_points int generated always as (
    movement_points + movement_bonus_points
    + nutrition_points + nutrition_bonus_points
    + lesson_points + meditation_points + gratitude_points
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.nutrition_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  date date not null,
  photo_url text not null,
  points int not null default 0,
  bonus_points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.first_completions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  order_position int not null check (order_position in (1, 2, 3)),
  created_at timestamptz not null default now(),
  unique (company_id, date, order_position),
  unique (company_id, date, user_id)
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);

-- Indexes --------------------------------------------------------------------

create index if not exists company_members_user_idx on public.company_members (user_id);
create index if not exists company_members_company_idx on public.company_members (company_id);
create index if not exists profiles_company_idx on public.profiles (company_id);
create index if not exists challenges_company_idx on public.challenges (company_id);
create index if not exists daily_log_user_date_idx on public.daily_log (user_id, date);
create index if not exists daily_log_company_date_idx on public.daily_log (company_id, date);
create index if not exists nutrition_log_user_date_idx on public.nutrition_log (user_id, date);
create index if not exists first_completions_company_date_idx on public.first_completions (company_id, date);

-- Triggers -------------------------------------------------------------------

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists daily_log_set_updated_at on public.daily_log;
create trigger daily_log_set_updated_at
before update on public.daily_log
for each row execute function public.handle_updated_at();

drop trigger if exists user_streaks_set_updated_at on public.user_streaks;
create trigger user_streaks_set_updated_at
before update on public.user_streaks
for each row execute function public.handle_updated_at();

-- Storage bucket -------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('nutrition_photos', 'nutrition_photos', false)
on conflict (id) do update set public = excluded.public;

-- Row level security ---------------------------------------------------------

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenge enable row level security;
alter table public.daily_log enable row level security;
alter table public.nutrition_log enable row level security;
alter table public.first_completions enable row level security;
alter table public.user_streaks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'companies' and policyname = 'companies_public_read'
  ) then
    create policy companies_public_read on public.companies
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'company_members' and policyname = 'company_members_self_manage'
  ) then
    create policy company_members_self_manage on public.company_members
      for all
      using (auth.uid() = user_id
        or exists (
          select 1
          from public.company_members admins
          where admins.company_id = company_members.company_id
            and admins.user_id = auth.uid()
            and admins.role = 'admin'
        ))
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_self_access'
  ) then
    create policy profiles_self_access on public.profiles
      for all
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'challenges' and policyname = 'challenges_company_read'
  ) then
    create policy challenges_company_read on public.challenges
      for select
      using (exists (
        select 1 from public.company_members cm
        where cm.company_id = challenges.company_id
          and cm.user_id = auth.uid()
      ));
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'user_challenge' and policyname = 'user_challenge_self_manage'
  ) then
    create policy user_challenge_self_manage on public.user_challenge
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'daily_log' and policyname = 'daily_log_self_select'
  ) then
    create policy daily_log_self_select on public.daily_log
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'daily_log' and policyname = 'daily_log_today_only'
  ) then
    create policy daily_log_today_only on public.daily_log
      for insert
      with check (
        auth.uid() = user_id
        and date = public.current_local_date()
      );

    create policy daily_log_today_update on public.daily_log
      for update
      using (auth.uid() = user_id and date = public.current_local_date())
      with check (auth.uid() = user_id and date = public.current_local_date());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'nutrition_log' and policyname = 'nutrition_log_self_manage'
  ) then
    create policy nutrition_log_self_manage on public.nutrition_log
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id and date = public.current_local_date());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'first_completions' and policyname = 'first_completions_company_view'
  ) then
    create policy first_completions_company_view on public.first_completions
      for select
      using (exists (
        select 1
        from public.company_members cm
        where cm.company_id = first_completions.company_id
          and cm.user_id = auth.uid()
      ));
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'user_streaks' and policyname = 'user_streaks_self_manage'
  ) then
    create policy user_streaks_self_manage on public.user_streaks
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Storage policies -----------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'nutrition_photos_owner_read'
  ) then
    create policy nutrition_photos_owner_read
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'nutrition_photos'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'nutrition_photos_owner_insert'
  ) then
    create policy nutrition_photos_owner_insert
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'nutrition_photos'
        and auth.uid()::text = split_part(name, '/', 1)
      );
  end if;
end $$;

-- RPCs -----------------------------------------------------------------------

create or replace function public.claim_first_completion(company_id uuid, user_id uuid, log_date date)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned int;
begin
  if log_date <> public.current_local_date() then
    raise exception 'This activity is only available today.';
  end if;

  select order_position
    into assigned
  from public.first_completions
  where company_id = claim_first_completion.company_id
    and user_id = claim_first_completion.user_id
    and date = log_date
  limit 1;

  if found then
    return assigned;
  end if;

  perform pg_advisory_xact_lock(hashtext(company_id::text || log_date::text));

  select coalesce(max(order_position), 0) + 1
    into assigned
  from public.first_completions
  where company_id = claim_first_completion.company_id
    and date = log_date;

  if assigned > 3 then
    return null;
  end if;

  insert into public.first_completions (company_id, user_id, date, order_position)
  values (company_id, user_id, log_date, assigned)
  returning order_position into assigned;

  return assigned;
end;
$$;

create or replace function public.get_daily_leaderboard(target_company_id uuid, tz text default 'America/Santiago')
returns table (
  user_id uuid,
  display_name text,
  total_points int
)
language sql
security definer
set search_path = public
as $$
  with today as (
    select public.current_local_date(tz) as current_day
  )
  select
    dl.user_id,
    coalesce(p.name, split_part(u.email, '@', 1)) as display_name,
    dl.total_points
  from public.daily_log dl
  join auth.users u on u.id = dl.user_id
  left join public.profiles p on p.id = dl.user_id
  join today on true
  where dl.company_id = target_company_id
    and dl.date = today.current_day
  order by dl.total_points desc, display_name asc;
$$;

create or replace function public.get_weekly_leaderboard(target_company_id uuid, tz text default 'America/Santiago')
returns table (
  user_id uuid,
  display_name text,
  total_points int
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select
      public.current_local_date(tz) as today,
      date_trunc('week', public.current_local_date(tz)::timestamp)::date as week_start
  )
  select
    dl.user_id,
    coalesce(p.name, split_part(u.email, '@', 1)) as display_name,
    sum(dl.total_points) as total_points
  from public.daily_log dl
  join auth.users u on u.id = dl.user_id
  left join public.profiles p on p.id = dl.user_id
  join bounds b on true
  where dl.company_id = target_company_id
    and dl.date between b.week_start and b.today
  group by dl.user_id, display_name
  order by total_points desc, display_name asc;
$$;

create or replace function public.get_monthly_leaderboard(target_company_id uuid, tz text default 'America/Santiago')
returns table (
  user_id uuid,
  display_name text,
  total_points int
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select
      public.current_local_date(tz) as today,
      date_trunc('month', public.current_local_date(tz)::timestamp)::date as month_start
  )
  select
    dl.user_id,
    coalesce(p.name, split_part(u.email, '@', 1)) as display_name,
    sum(dl.total_points) as total_points
  from public.daily_log dl
  join auth.users u on u.id = dl.user_id
  left join public.profiles p on p.id = dl.user_id
  join bounds b on true
  where dl.company_id = target_company_id
    and dl.date between b.month_start and b.today
  group by dl.user_id, display_name
  order by total_points desc, display_name asc;
$$;

grant execute on function public.claim_first_completion(uuid, uuid, date) to authenticated;
grant execute on function public.get_daily_leaderboard(uuid, text) to authenticated;
grant execute on function public.get_weekly_leaderboard(uuid, text) to authenticated;
grant execute on function public.get_monthly_leaderboard(uuid, text) to authenticated;
