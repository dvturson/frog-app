-- =============================================================================
-- JMU LEAP: 0001 schema
-- Tables, the leaderboard view, and realtime. Security lives in 0002_rls.sql,
-- point-changing logic lives in 0003_functions.sql.
-- Run order: 0001 -> 0002 -> 0003 -> seed.sql
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Functions in `private` are NOT exposed through the Supabase API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------- Enums ------------------------------------------------------------
create type public.user_role      as enum ('freshman', 'frog', 'admin');
create type public.event_type     as enum ('session', 'frogolympics');
create type public.checkin_status as enum ('arrived', 'stayed', 'left');
create type public.chat_channel   as enum ('announcements', 'group', 'dm');

-- ---------- FROG groups ------------------------------------------------------
-- Group totals are NOT stored here; they are computed in group_leaderboard
-- so there is only one source of truth for points.
create table public.frog_groups (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  frog_leader_id  uuid,                       -- FK added after profiles exists
  created_at      timestamptz not null default now()
);

-- ---------- Profiles (1:1 with auth.users) -----------------------------------
-- role is NULL for anyone not on the roster -> the app shows the "Sorry" message.
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text not null,
  role              public.user_role,
  major             text,
  frog_group_id     uuid references public.frog_groups (id) on delete set null,
  points            int  not null default 0,  -- points this member earned FOR their group
  xp                int  not null default 0,  -- personal XP (drives level in the top bar)
  current_streak    int  not null default 0,
  last_active_date  date,                     -- last day they attended a FROG event (America/New_York)
  created_at        timestamptz not null default now()
);

alter table public.frog_groups
  add constraint frog_groups_frog_leader_id_fkey
  foreign key (frog_leader_id) references public.profiles (id) on delete set null;

-- ---------- Roster (admin's pre-assignment list) -----------------------------
-- When an auth user is created, handle_new_user() copies role + group from here.
-- The admin CSV upload (TODO) will write to this table.
create table public.roster (
  email          text primary key,
  role           public.user_role not null,
  frog_group_id  uuid references public.frog_groups (id) on delete set null
);

-- ---------- Events -----------------------------------------------------------
-- frog_group_id NULL  = everyone (admin-created mandatory events, FROGolympics)
-- frog_group_id set   = one group's optional event (max 3 per group per day)
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  type           public.event_type not null default 'session',
  is_mandatory   boolean not null default false,
  frog_group_id  uuid references public.frog_groups (id) on delete cascade,
  location_name  text,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  xp             int not null default 10,
  created_by     uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at     timestamptz not null default now(),
  constraint events_min_30_minutes check (ends_at >= starts_at + interval '30 minutes')
);
create index events_starts_at_idx on public.events (starts_at);

-- The QR secret lives in its own table with RLS on and NO policies,
-- so no client can ever read it. Only security-definer functions touch it.
create table public.event_secrets (
  event_id  uuid primary key references public.events (id) on delete cascade,
  secret    bytea not null default extensions.gen_random_bytes(32)
);

-- ---------- Check-ins --------------------------------------------------------
-- Step 1: student scans QR      -> status 'arrived'   (check_in function)
-- Step 2: FROG marks at the end -> 'stayed' or 'left' (confirm_attendance function)
create table public.checkins (
  event_id        uuid not null references public.events (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  status          public.checkin_status not null default 'arrived',
  points_awarded  int not null default 0,     -- 1 + any streak bonus, for auditing
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  confirmed_by    uuid references public.profiles (id),
  primary key (event_id, user_id)
);

-- ---------- FROGolympics results ---------------------------------------------
-- A FROG enters placements; points only count once an admin verifies.
create table public.olympics_results (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  frog_group_id   uuid not null references public.frog_groups (id) on delete cascade,
  placement       int  not null check (placement between 1 and 4),
  points_awarded  int  not null default 0,    -- set by trigger from placement
  entered_by      uuid references public.profiles (id) default auth.uid(),
  verified_by     uuid references public.profiles (id),
  verified_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (event_id, frog_group_id)
);

-- ---------- Chat -------------------------------------------------------------
-- announcements: FROG -> group (students read-only)
-- group:         everyone in the group + their FROG
-- dm:            one student <-> their FROG (recipient_id required)
create table public.messages (
  id             bigint generated always as identity primary key,
  frog_group_id  uuid not null references public.frog_groups (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  channel        public.chat_channel not null,
  recipient_id   uuid references public.profiles (id) on delete cascade,
  body           text not null check (char_length(body) between 1 and 2000),
  created_at     timestamptz not null default now(),
  constraint messages_dm_has_recipient check ((channel = 'dm') = (recipient_id is not null))
);
create index messages_group_created_idx on public.messages (frog_group_id, created_at);

-- ---------- Leaderboard view -------------------------------------------------
-- total = sum of member points (attendance + streak bonuses) + verified olympics points
create view public.group_leaderboard
with (security_invoker = true) as
select
  t.*,
  rank() over (order by t.total_points desc) as rank
from (
  select
    g.id,
    g.name,
    g.frog_leader_id,
    coalesce(m.member_points, 0)                                as member_points,
    coalesce(o.olympics_points, 0)                              as olympics_points,
    coalesce(m.member_points, 0) + coalesce(o.olympics_points, 0) as total_points
  from public.frog_groups g
  left join (
    select frog_group_id, sum(points)::int as member_points
    from public.profiles
    group by frog_group_id
  ) m on m.frog_group_id = g.id
  left join (
    select frog_group_id, sum(points_awarded)::int as olympics_points
    from public.olympics_results
    where verified_at is not null
    group by frog_group_id
  ) o on o.frog_group_id = g.id
) t;

-- ---------- Realtime ---------------------------------------------------------
-- messages: live chat. profiles + olympics_results: leaderboard refreshes.
-- checkins: FROG attendance screen updates as students scan.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.olympics_results;
alter publication supabase_realtime add table public.checkins;
