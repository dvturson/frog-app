-- =============================================================================
-- JMU LEAP: 0004 public-demo chat cleanup
-- The demo accounts are shared, so anyone can post in chat. Every 5 minutes,
-- delete messages that are not seed data and are older than 10 minutes. A posted
-- message therefore lasts 10–15 minutes. Seed messages are flagged with is_seed
-- and are never deleted.
--
-- Clients cannot set is_seed: their INSERT grant only covers
-- (frog_group_id, channel, recipient_id, body), so it always defaults to false.
--
-- To stop the purge (e.g. for a real FROG Week):
--   select cron.unschedule('purge-demo-chat');
-- =============================================================================

alter table public.messages
  add column if not exists is_seed boolean not null default false;

-- Treat every message in the DB right now as seed data. Run this migration
-- right after seed.sql, before the link goes public. seed.sql also re-flags its
-- rows whenever it is re-run.
update public.messages set is_seed = true;

-- pg_cron is included in every Supabase plan, free tier too.
create extension if not exists pg_cron with schema pg_catalog;

-- cron.schedule with an existing job name replaces that job, so this is safe to re-run.
select cron.schedule(
  'purge-demo-chat',
  '*/5 * * * *',
  $$delete from public.messages
    where not is_seed
      and created_at < now() - interval '10 minutes'$$
);
