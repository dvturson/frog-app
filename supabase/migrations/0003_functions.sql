-- =============================================================================
-- JMU LEAP: 0003 functions and triggers
-- This file is the ONLY place points, XP and streaks change.
--
--   get_event_code(event_id)            FROG's screen -> rotating 6-char code (QR)
--   check_in(event_id, code)            student scan  -> checkins.status = 'arrived'
--   confirm_attendance(event, user, ok) FROG at end   -> 'stayed' (+points, +xp, streak) or 'left'
--   verify_olympics_result(result_id)   admin         -> olympics points start counting
--
-- Time zone for "what day is it" logic: America/New_York.
-- =============================================================================

-- ---------- Private helpers (not callable through the API) -------------------

-- Which 20-second window are we in? (Unix seconds / 20)
create or replace function private.current_window()
returns bigint language sql stable
as $$ select floor(extract(epoch from now()) / 20)::bigint $$;

-- 'upcoming' -> 'checkin' (5 min before start until halfway) -> 'attendance' (halfway to end) -> 'over'
-- Keep in sync with src/features/events/eventPhase.js
create or replace function private.event_phase(p_starts timestamptz, p_ends timestamptz)
returns text language sql stable
as $$
  select case
    when now() <  p_starts - interval '5 minutes'      then 'upcoming'
    when now() <  p_starts + (p_ends - p_starts) / 2   then 'checkin'
    when now() <  p_ends                               then 'attendance'
    else 'over'
  end
$$;

-- Short code = first 6 hex chars of HMAC-SHA256(secret, "<event_id>:<window>")
create or replace function private.event_code(p_event_id uuid, p_window bigint)
returns text language sql stable
as $$
  select upper(substr(encode(
           extensions.hmac(convert_to(p_event_id::text || ':' || p_window::text, 'UTF8'),
                           s.secret, 'sha256'),
           'hex'), 1, 6))
  from public.event_secrets s
  where s.event_id = p_event_id
$$;

-- ---------- get_event_code ---------------------------------------------------
-- Allowed: the event's creator, or a FROG whose group can see the event
-- (so every FROG can show the QR for admin-created mandatory events).
create or replace function public.get_event_code(p_event_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  e public.events;
begin
  select * into e from public.events where id = p_event_id;
  if not found then
    raise exception 'Event not found';
  end if;

  if not (e.created_by = auth.uid()
          or (public.my_role() = 'frog'
              and (e.frog_group_id is null or e.frog_group_id = public.my_group_id()))) then
    raise exception 'Only this event''s FROG can show its check-in code';
  end if;

  if private.event_phase(e.starts_at, e.ends_at) <> 'checkin' then
    raise exception 'Check-in is not open for this event';
  end if;

  return private.event_code(e.id, private.current_window());
end;
$$;

-- ---------- check_in ---------------------------------------------------------
-- Accepts the current OR previous window's code (covers slow scans / clock drift).
-- Only records arrival; points come later from confirm_attendance.
create or replace function public.check_in(p_event_id uuid, p_code text)
returns public.checkins
language plpgsql security definer set search_path = ''
as $$
declare
  e      public.events;
  w      bigint := private.current_window();
  result public.checkins;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if public.my_role() is distinct from 'freshman' then
    raise exception 'Only freshmen check in to events';
  end if;

  select * into e from public.events where id = p_event_id;
  if not found or (e.frog_group_id is not null and e.frog_group_id is distinct from public.my_group_id()) then
    raise exception 'Event not found';
  end if;

  if private.event_phase(e.starts_at, e.ends_at) <> 'checkin' then
    raise exception 'Check-in is not open for this event';
  end if;

  if upper(trim(p_code)) not in (private.event_code(e.id, w), private.event_code(e.id, w - 1)) then
    raise exception 'That code has expired. Scan the QR again.';
  end if;

  insert into public.checkins (event_id, user_id)
  values (e.id, auth.uid())
  on conflict (event_id, user_id) do nothing
  returning * into result;

  if not found then
    raise exception 'You already checked in to this event';
  end if;

  return result;
end;
$$;

-- ---------- confirm_attendance -----------------------------------------------
-- FROG marks a checked-in student as stayed (green check) or left (red X).
-- Stayed: +1 group point, +event.xp personal XP, streak update, and on day n of
-- a streak (n >= 2) the FIRST optional event that day earns a +n bonus.
create or replace function public.confirm_attendance(p_event_id uuid, p_user_id uuid, p_stayed boolean)
returns public.checkins
language plpgsql security definer set search_path = ''
as $$
declare
  e          public.events;
  p          public.profiles;
  c          public.checkins;
  event_day  date;
  new_streak int;
  bonus      int := 0;
begin
  select * into e from public.events where id = p_event_id;
  if not found then
    raise exception 'Event not found';
  end if;

  select * into p from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'Student not found';
  end if;

  if not (public.my_role() = 'admin'
          or (public.my_role() = 'frog' and p.frog_group_id = public.my_group_id())) then
    raise exception 'Only this student''s FROG can confirm attendance';
  end if;

  if private.event_phase(e.starts_at, e.ends_at) not in ('attendance', 'over') then
    raise exception 'Attendance opens halfway through the event';
  end if;

  select * into c from public.checkins
  where event_id = e.id and user_id = p_user_id
  for update;
  if not found then
    raise exception 'This student never checked in';
  end if;
  if c.status <> 'arrived' then
    raise exception 'Attendance already confirmed for this student';
  end if;

  -- Red X: record it, no points.
  if not p_stayed then
    update public.checkins
       set status = 'left', confirmed_at = now(), confirmed_by = auth.uid()
     where event_id = e.id and user_id = p_user_id
    returning * into c;
    return c;
  end if;

  -- Green check: streak first, then bonus, then points.
  event_day := (e.starts_at at time zone 'America/New_York')::date;
  new_streak := case
    when p.last_active_date >= event_day     then greatest(p.current_streak, 1) -- same day (or confirming an older event)
    when p.last_active_date =  event_day - 1 then p.current_streak + 1
    else 1
  end;

  if not e.is_mandatory and new_streak >= 2 and not exists (
       select 1
       from public.checkins c2
       join public.events e2 on e2.id = c2.event_id
       where c2.user_id = p_user_id
         and c2.points_awarded > 1
         and (e2.starts_at at time zone 'America/New_York')::date = event_day) then
    bonus := new_streak;
  end if;

  update public.checkins
     set status = 'stayed', points_awarded = 1 + bonus,
         confirmed_at = now(), confirmed_by = auth.uid()
   where event_id = e.id and user_id = p_user_id
  returning * into c;

  update public.profiles
     set points           = points + 1 + bonus,
         xp               = xp + e.xp,
         current_streak   = new_streak,
         last_active_date = greatest(coalesce(last_active_date, event_day), event_day)
   where id = p_user_id;

  return c;
end;
$$;

-- ---------- verify_olympics_result -------------------------------------------
create or replace function public.verify_olympics_result(p_result_id uuid)
returns public.olympics_results
language plpgsql security definer set search_path = ''
as $$
declare
  r public.olympics_results;
begin
  if public.my_role() is distinct from 'admin' then
    raise exception 'Only an admin can verify FROGolympics results';
  end if;

  update public.olympics_results
     set verified_by = auth.uid(), verified_at = now()
   where id = p_result_id and verified_at is null
  returning * into r;

  if not found then
    raise exception 'Result not found or already verified';
  end if;
  return r;
end;
$$;

-- ---------- Function privileges ----------------------------------------------
revoke execute on function public.get_event_code(uuid)                     from public, anon;
revoke execute on function public.check_in(uuid, text)                     from public, anon;
revoke execute on function public.confirm_attendance(uuid, uuid, boolean)  from public, anon;
revoke execute on function public.verify_olympics_result(uuid)             from public, anon;
grant  execute on function public.get_event_code(uuid)                     to authenticated;
grant  execute on function public.check_in(uuid, text)                     to authenticated;
grant  execute on function public.confirm_attendance(uuid, uuid, boolean)  to authenticated;
grant  execute on function public.verify_olympics_result(uuid)             to authenticated;

-- =============================================================================
-- Triggers
-- =============================================================================

-- New auth user -> profile. Role + group come from the roster (NULL if not listed).
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role, frog_group_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    (select r.role          from public.roster r where lower(r.email) = lower(new.email)),
    (select r.frog_group_id from public.roster r where lower(r.email) = lower(new.email))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- New event -> random QR secret.
create or replace function private.create_event_secret()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.event_secrets (event_id) values (new.id);
  return new;
end;
$$;

create trigger on_event_created
  after insert on public.events
  for each row execute function private.create_event_secret();

-- Max 3 optional events per group per (local) day.
create or replace function private.enforce_optional_event_limit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not new.is_mandatory and new.frog_group_id is not null and (
       select count(*) from public.events e
       where e.frog_group_id = new.frog_group_id
         and not e.is_mandatory
         and e.id <> new.id
         and (e.starts_at at time zone 'America/New_York')::date
             = (new.starts_at at time zone 'America/New_York')::date
     ) >= 3 then
    raise exception 'Your group already has 3 optional events that day';
  end if;
  return new;
end;
$$;

create trigger enforce_optional_event_limit
  before insert or update of starts_at on public.events
  for each row execute function private.enforce_optional_event_limit();

-- Olympics placement -> points. Change the numbers here if the team picks others.
create or replace function private.set_olympics_points()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select type from public.events where id = new.event_id) is distinct from 'frogolympics' then
    raise exception 'Results can only be entered for FROGolympics events';
  end if;
  new.points_awarded := case new.placement when 1 then 40 when 2 then 20 when 3 then 10 else 5 end;
  return new;
end;
$$;

create trigger set_olympics_points
  before insert or update of placement on public.olympics_results
  for each row execute function private.set_olympics_points();
