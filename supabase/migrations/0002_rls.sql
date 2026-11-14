-- =============================================================================
-- JMU LEAP: 0002 row level security
-- Rule of thumb:
--   * Everyone signed in can read public info (groups, profiles, leaderboard).
--   * Chat is limited to your own group (DMs only to the two people in them).
--   * Point/XP/streak columns are NOT writable by clients at all; only the
--     security-definer functions in 0003 change them.
-- =============================================================================

-- ---------- Helpers (security definer = no RLS recursion) --------------------
create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.my_group_id()
returns uuid
language sql stable security definer set search_path = ''
as $$ select frog_group_id from public.profiles where id = auth.uid() $$;

revoke execute on function public.my_role(), public.my_group_id() from public, anon;
grant  execute on function public.my_role(), public.my_group_id() to authenticated;

-- ---------- Table privileges -------------------------------------------------
-- Start from zero, then grant exactly what the app needs. Column lists are how
-- we stop clients from touching points/xp/streak/role/verified_* directly.
revoke all on all tables in schema public from anon, authenticated;

grant select                                   on public.frog_groups      to authenticated;
grant insert, update, delete                   on public.frog_groups      to authenticated; -- admin-only via policy
grant select, insert, update, delete           on public.roster           to authenticated; -- admin-only via policy
grant select                                   on public.profiles         to authenticated;
grant update (display_name, major)             on public.profiles         to authenticated;
grant select, delete                           on public.events           to authenticated;
grant insert (title, description, type, is_mandatory, frog_group_id, location_name, starts_at, ends_at)
                                               on public.events           to authenticated;
grant update (title, description, location_name, starts_at, ends_at)
                                               on public.events           to authenticated;
-- event_secrets: no grants at all.
grant select                                   on public.checkins         to authenticated; -- writes via functions only
grant select, delete                           on public.olympics_results to authenticated;
grant insert (event_id, frog_group_id, placement) on public.olympics_results to authenticated;
grant update (placement)                       on public.olympics_results to authenticated;
grant select                                   on public.messages         to authenticated;
grant insert (frog_group_id, channel, recipient_id, body) on public.messages to authenticated;
grant select                                   on public.group_leaderboard to authenticated;

-- ---------- Enable RLS everywhere --------------------------------------------
alter table public.frog_groups      enable row level security;
alter table public.profiles         enable row level security;
alter table public.roster           enable row level security;
alter table public.events           enable row level security;
alter table public.event_secrets    enable row level security; -- no policies = locked
alter table public.checkins         enable row level security;
alter table public.olympics_results enable row level security;
alter table public.messages         enable row level security;

-- ---------- frog_groups ------------------------------------------------------
create policy "groups: anyone signed in can read"
  on public.frog_groups for select to authenticated using (true);
create policy "groups: admin manages"
  on public.frog_groups for all to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- ---------- profiles ---------------------------------------------------------
create policy "profiles: anyone signed in can read"
  on public.profiles for select to authenticated using (true);
create policy "profiles: edit your own (name, major only, see grants)"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------- roster -----------------------------------------------------------
create policy "roster: admin only"
  on public.roster for all to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- ---------- events -----------------------------------------------------------
create policy "events: read all-group events and your group's events"
  on public.events for select to authenticated
  using (frog_group_id is null or frog_group_id = public.my_group_id() or public.my_role() = 'admin');

create policy "events: FROGs create optional sessions for their group; admin anything"
  on public.events for insert to authenticated
  with check (
    created_by = auth.uid() and (
      public.my_role() = 'admin'
      or (public.my_role() = 'frog'
          and frog_group_id = public.my_group_id()
          and not is_mandatory
          and type = 'session')
    )
  );

create policy "events: creators (or admin) edit"
  on public.events for update to authenticated
  using (created_by = auth.uid() or public.my_role() = 'admin')
  with check (created_by = auth.uid() or public.my_role() = 'admin');

create policy "events: creators (or admin) delete"
  on public.events for delete to authenticated
  using (created_by = auth.uid() or public.my_role() = 'admin');

-- ---------- checkins (read-only for clients) ---------------------------------
create policy "checkins: own rows, your group's FROG, or admin"
  on public.checkins for select to authenticated
  using (
    user_id = auth.uid()
    or public.my_role() = 'admin'
    or (public.my_role() = 'frog' and exists (
          select 1 from public.profiles p
          where p.id = checkins.user_id and p.frog_group_id = public.my_group_id()))
  );

-- ---------- olympics_results -------------------------------------------------
create policy "olympics: anyone signed in can read"
  on public.olympics_results for select to authenticated using (true);
create policy "olympics: FROGs/admin enter results"
  on public.olympics_results for insert to authenticated
  with check (public.my_role() in ('frog', 'admin'));
create policy "olympics: FROGs/admin edit until verified"
  on public.olympics_results for update to authenticated
  using (public.my_role() in ('frog', 'admin') and verified_at is null)
  with check (public.my_role() in ('frog', 'admin') and verified_at is null);
create policy "olympics: FROGs/admin delete until verified"
  on public.olympics_results for delete to authenticated
  using (public.my_role() in ('frog', 'admin') and verified_at is null);

-- ---------- messages ---------------------------------------------------------
create policy "messages: read your group's channels and your own DMs"
  on public.messages for select to authenticated
  using (
    public.my_role() = 'admin'
    or (frog_group_id = public.my_group_id()
        and (channel <> 'dm' or user_id = auth.uid() or recipient_id = auth.uid()))
  );

create policy "messages: post in your group (announcements = FROG only, DMs = student<->FROG)"
  on public.messages for insert to authenticated
  with check (
    user_id = auth.uid()
    and frog_group_id = public.my_group_id()
    and (
      channel = 'group'
      or (channel = 'announcements' and public.my_role() = 'frog')
      or (channel = 'dm' and exists (
            select 1 from public.profiles r
            where r.id = recipient_id
              and r.frog_group_id = public.my_group_id()
              and (public.my_role() = 'frog' or r.role = 'frog')))
    )
  );
