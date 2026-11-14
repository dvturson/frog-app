-- =============================================================================
-- JMU LEAP: demo seed
-- Run AFTER the three migrations (Supabase dashboard -> SQL Editor -> paste -> Run).
-- Safe to re-run: it deletes the previous demo data first.
--
-- Every demo account uses the password:  LeapFrog2026!
--   admin@leap.demo          admin
--   frog1..frog4@leap.demo   FROG leaders (one per group)
--   student1..16@leap.demo   freshmen (4 per group)
--   visitor@leap.demo        NOT on the roster -> shows the "Sorry" message
--
-- Event times are relative to now() so the demo always has a live event:
--   "Sit with Strangers at D-Hall"  -> check-in open now (QR demo, group Duke Dogs)
--   "Arboretum Walk & Talk"         -> past halfway (attendance demo, Duke Dogs)
-- =============================================================================

-- ---------- Clean up previous demo data --------------------------------------
delete from public.events where id::text like 'e0000000-%';  -- cascades to checkins, olympics_results
delete from auth.users where email like '%@leap.demo';         -- cascades to profiles, messages
delete from public.roster where email like '%@leap.demo';
delete from public.frog_groups where id::text like '11111111-%';

-- ---------- Helper: create a confirmed email+password user -------------------
create or replace function pg_temp.create_demo_user(p_id uuid, p_email text, p_name text)
returns void language plpgsql as $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
    extensions.crypt('LeapFrog2026!', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', p_name), now(), now(),
    '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), p_id, p_id::text,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now()
  );
end;
$$;

-- ---------- Groups -----------------------------------------------------------
insert into public.frog_groups (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Duke Dogs'),
  ('11111111-0000-0000-0000-000000000002', 'Purple Pride'),
  ('11111111-0000-0000-0000-000000000003', 'Bluestone Bunch'),
  ('11111111-0000-0000-0000-000000000004', 'Quad Squad');

-- ---------- Roster (admin pre-assignment) ------------------------------------
-- handle_new_user() reads this when the auth users below are created.
insert into public.roster (email, role, frog_group_id) values
  ('admin@leap.demo',     'admin',    null),
  ('frog1@leap.demo',     'frog',     '11111111-0000-0000-0000-000000000001'),
  ('frog2@leap.demo',     'frog',     '11111111-0000-0000-0000-000000000002'),
  ('frog3@leap.demo',     'frog',     '11111111-0000-0000-0000-000000000003'),
  ('frog4@leap.demo',     'frog',     '11111111-0000-0000-0000-000000000004'),
  ('student1@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000001'),
  ('student2@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000001'),
  ('student3@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000001'),
  ('student4@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000001'),
  ('student5@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000002'),
  ('student6@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000002'),
  ('student7@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000002'),
  ('student8@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000002'),
  ('student9@leap.demo',  'freshman', '11111111-0000-0000-0000-000000000003'),
  ('student10@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000003'),
  ('student11@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000003'),
  ('student12@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000003'),
  ('student13@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000004'),
  ('student14@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000004'),
  ('student15@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000004'),
  ('student16@leap.demo', 'freshman', '11111111-0000-0000-0000-000000000004');

-- ---------- Users (profiles are created by the trigger) ----------------------
select pg_temp.create_demo_user('ad000000-0000-0000-0000-000000000001', 'admin@leap.demo',     'WoW Admin');
select pg_temp.create_demo_user('f0000000-0000-0000-0000-000000000001', 'frog1@leap.demo',     'Alex Rivera');
select pg_temp.create_demo_user('f0000000-0000-0000-0000-000000000002', 'frog2@leap.demo',     'Jordan Kim');
select pg_temp.create_demo_user('f0000000-0000-0000-0000-000000000003', 'frog3@leap.demo',     'Sam Patel');
select pg_temp.create_demo_user('f0000000-0000-0000-0000-000000000004', 'frog4@leap.demo',     'Taylor Brooks');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000001', 'student1@leap.demo',  'Maya Johnson');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000002', 'student2@leap.demo',  'Ethan Nguyen');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000003', 'student3@leap.demo',  'Olivia Martinez');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000004', 'student4@leap.demo',  'Noah Williams');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000005', 'student5@leap.demo',  'Ava Thompson');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000006', 'student6@leap.demo',  'Liam Garcia');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000007', 'student7@leap.demo',  'Sophia Lee');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000008', 'student8@leap.demo',  'Mason Davis');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000009', 'student9@leap.demo',  'Isabella Brown');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000010', 'student10@leap.demo', 'Lucas Wilson');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000011', 'student11@leap.demo', 'Mia Anderson');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000012', 'student12@leap.demo', 'Elijah Taylor');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000013', 'student13@leap.demo', 'Harper Moore');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000014', 'student14@leap.demo', 'James Jackson');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000015', 'student15@leap.demo', 'Amelia White');
select pg_temp.create_demo_user('a0000000-0000-0000-0000-000000000016', 'student16@leap.demo', 'Benjamin Harris');
select pg_temp.create_demo_user('b0000000-0000-0000-0000-000000000001', 'visitor@leap.demo',   'Visiting Parent');

-- ---------- FROG leaders -----------------------------------------------------
update public.frog_groups set frog_leader_id = 'f0000000-0000-0000-0000-000000000001' where id = '11111111-0000-0000-0000-000000000001';
update public.frog_groups set frog_leader_id = 'f0000000-0000-0000-0000-000000000002' where id = '11111111-0000-0000-0000-000000000002';
update public.frog_groups set frog_leader_id = 'f0000000-0000-0000-0000-000000000003' where id = '11111111-0000-0000-0000-000000000003';
update public.frog_groups set frog_leader_id = 'f0000000-0000-0000-0000-000000000004' where id = '11111111-0000-0000-0000-000000000004';

-- ---------- Majors, points, XP, streaks (seed only; the app uses functions) --
update public.profiles p set
  major = v.major, points = v.points, xp = v.xp, current_streak = v.streak,
  last_active_date = case when v.streak > 0
                          then (now() at time zone 'America/New_York')::date - 1 end
from (values
  ('f0000000-0000-0000-0000-000000000001'::uuid, 'Kinesiology',                       0,   0, 0),
  ('f0000000-0000-0000-0000-000000000002'::uuid, 'Political Science',                 0,   0, 0),
  ('f0000000-0000-0000-0000-000000000003'::uuid, 'Integrated Science & Technology',   0,   0, 0),
  ('f0000000-0000-0000-0000-000000000004'::uuid, 'Media Arts & Design',               0,   0, 0),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'Nursing',                           6, 120, 3),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'Computer Science',                  4,  80, 2),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'Biology',                           3,  60, 2),
  ('a0000000-0000-0000-0000-000000000004'::uuid, 'Undeclared',                        1,  20, 1),
  ('a0000000-0000-0000-0000-000000000005'::uuid, 'Business Management',               5, 100, 3),
  ('a0000000-0000-0000-0000-000000000006'::uuid, 'Engineering',                       2,  40, 1),
  ('a0000000-0000-0000-0000-000000000007'::uuid, 'Psychology',                        4,  80, 2),
  ('a0000000-0000-0000-0000-000000000008'::uuid, 'Music Education',                   2,  40, 1),
  ('a0000000-0000-0000-0000-000000000009'::uuid, 'Communication Studies',             3,  60, 2),
  ('a0000000-0000-0000-0000-000000000010'::uuid, 'Dietetics',                         2,  40, 1),
  ('a0000000-0000-0000-0000-000000000011'::uuid, 'Studio Art',                        1,  20, 1),
  ('a0000000-0000-0000-0000-000000000012'::uuid, 'Health Sciences',                   2,  40, 1),
  ('a0000000-0000-0000-0000-000000000013'::uuid, 'Integrated Science & Technology',   4,  80, 2),
  ('a0000000-0000-0000-0000-000000000014'::uuid, 'Finance',                           3,  60, 2),
  ('a0000000-0000-0000-0000-000000000015'::uuid, 'Hospitality Management',            2,  40, 1),
  ('a0000000-0000-0000-0000-000000000016'::uuid, 'Geology',                           0,   0, 0)
) as v(id, major, points, xp, streak)
where p.id = v.id;

-- ---------- Events -----------------------------------------------------------
insert into public.events (id, title, description, type, is_mandatory, frog_group_id, location_name, starts_at, ends_at, xp, created_by) values
  ('e0000000-0000-0000-0000-000000000001', 'FROG Week Kickoff',
   'Meet every FROG group at once. Sit next to someone you have never met.',
   'session', true, null, 'Bridgeforth Stadium',
   now() - interval '1 day' - interval '3 hours', now() - interval '1 day' - interval '1 hour', 20,
   'ad000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'FROGlympics: Tug of War',
   'Groups face off on the Quad. Admin verifies the winners.',
   'frogolympics', true, null, 'The Quad',
   now() - interval '1 day', now() - interval '1 day' + interval '1 hour', 20,
   'ad000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'Arboretum Walk & Talk',
   'Walk the Edith J. Carrier Arboretum and learn one fun fact about each person.',
   'session', false, '11111111-0000-0000-0000-000000000001', 'Edith J. Carrier Arboretum',
   now() - interval '40 minutes', now() + interval '20 minutes', 10,
   'f0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'Sit with Strangers at D-Hall',
   'Grab lunch at D-Hall and sit at a table with people outside your group.',
   'session', false, '11111111-0000-0000-0000-000000000001', 'D-Hall',
   now() - interval '3 minutes', now() + interval '57 minutes', 10,
   'f0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000005', 'Taste of Downtown Harrisonburg',
   'Walk Court Square and try a downtown spot you have never been to.',
   'session', true, null, 'Court Square, Downtown Harrisonburg',
   now() + interval '3 hours', now() + interval '5 hours', 20,
   'ad000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000006', 'FROGlympics: Quad Relay',
   'Relay race across the Quad. 1st: 40, 2nd: 20, 3rd: 10, 4th: 5 points.',
   'frogolympics', true, null, 'The Quad',
   now() + interval '1 day', now() + interval '1 day' + interval '1 hour', 20,
   'ad000000-0000-0000-0000-000000000001');

-- ---------- Check-ins --------------------------------------------------------
-- Yesterday's kickoff: everyone in groups 1-2 stayed, some of 3-4.
insert into public.checkins (event_id, user_id, status, points_awarded, created_at, confirmed_at, confirmed_by)
select 'e0000000-0000-0000-0000-000000000001', p.id, 'stayed', 1,
       now() - interval '1 day' - interval '3 hours', now() - interval '1 day' - interval '1 hour',
       g.frog_leader_id
from public.profiles p join public.frog_groups g on g.id = p.frog_group_id
where p.role = 'freshman' and p.points > 0;

-- Arboretum walk (in progress, past halfway): 3 students scanned in, FROG hasn't marked them yet.
insert into public.checkins (event_id, user_id, status, created_at) values
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'arrived', now() - interval '38 minutes'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'arrived', now() - interval '37 minutes'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'arrived', now() - interval '35 minutes');

-- ---------- FROGlympics results (Tug of War, verified) ----------------------
insert into public.olympics_results (event_id, frog_group_id, placement, entered_by, verified_by, verified_at) values
  ('e0000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 1, 'f0000000-0000-0000-0000-000000000002', 'ad000000-0000-0000-0000-000000000001', now() - interval '23 hours'),
  ('e0000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 2, 'f0000000-0000-0000-0000-000000000002', 'ad000000-0000-0000-0000-000000000001', now() - interval '23 hours'),
  ('e0000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000004', 3, 'f0000000-0000-0000-0000-000000000002', 'ad000000-0000-0000-0000-000000000001', now() - interval '23 hours'),
  ('e0000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003', 4, 'f0000000-0000-0000-0000-000000000002', 'ad000000-0000-0000-0000-000000000001', now() - interval '23 hours');

-- ---------- Chat -------------------------------------------------------------
insert into public.messages (frog_group_id, user_id, channel, recipient_id, body, created_at) values
  ('11111111-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'announcements', null,
   'Welcome, Duke Dogs! Meet at the Arboretum entrance at 1. Wear comfy shoes.', now() - interval '2 hours'),
  ('11111111-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'announcements', null,
   'D-Hall lunch is starting! Sit with someone NOT in our group for bonus bragging rights.', now() - interval '5 minutes'),
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'group', null,
   'Anyone want to walk to the Arboretum together from Eagle Hall?', now() - interval '90 minutes'),
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'group', null,
   'Yes! Meet in the lobby at 12:45', now() - interval '88 minutes'),
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'group', null,
   'We are SO winning the relay tomorrow', now() - interval '30 minutes'),
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'dm', 'f0000000-0000-0000-0000-000000000001',
   'Hi Alex! Is it okay if I come late to the walk? I have a placement test.', now() - interval '3 hours'),
  ('11111111-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'dm', 'a0000000-0000-0000-0000-000000000003',
   'Totally fine, just scan in when you get there. Good luck!', now() - interval '170 minutes'),
  ('11111111-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'announcements', null,
   'Purple Pride took 1st in Tug of War! Keep it going tonight downtown.', now() - interval '20 hours'),
  ('11111111-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 'announcements', null,
   'Bluestone Bunch, let''s climb that leaderboard. Downtown dinner tonight!', now() - interval '4 hours'),
  ('11111111-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 'announcements', null,
   'Quad Squad: relay practice on the Quad after dinner. Bring water!', now() - interval '1 hour');
