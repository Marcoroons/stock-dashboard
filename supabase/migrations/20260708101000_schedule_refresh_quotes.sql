-- Schedule the refresh-quotes edge function every 2 minutes via pg_cron + pg_net.
-- The auth header value is read from Vault by name (`cron_secret`) at call time,
-- so no secret is stored in this migration. Seed it once with:
--   select vault.create_secret('<value>', 'cron_secret');
-- and set the matching function secret: supabase secrets set CRON_SECRET=<value>

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Reschedule idempotently (unschedule is a no-op if the job doesn't exist yet).
do $$
begin
  perform cron.unschedule('refresh-quotes');
exception when others then
  null;
end $$;

select cron.schedule(
  'refresh-quotes',
  '*/2 * * * *',
  $cron$
  select net.http_post(
    url     := 'https://urrhzmmbnnyzemdyqewa.supabase.co/functions/v1/refresh-quotes',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $cron$
);
