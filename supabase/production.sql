-- Private single-owner tables. Only the authenticated server may access them.
create table public.la_leads (id text primary key, data jsonb not null);
create table public.la_notes (id text primary key, lead_id text not null references public.la_leads(id) on delete cascade, data jsonb not null);
create table public.la_activities (id text primary key, lead_id text not null references public.la_leads(id) on delete cascade, data jsonb not null);
create table public.la_runs (id text primary key, data jsonb not null);
create table public.la_settings (id text primary key, data jsonb not null);
alter table public.la_leads enable row level security;
alter table public.la_notes enable row level security;
alter table public.la_activities enable row level security;
alter table public.la_runs enable row level security;
alter table public.la_settings enable row level security;
revoke all on public.la_leads, public.la_notes, public.la_activities, public.la_runs, public.la_settings from anon, authenticated;
grant all on public.la_leads, public.la_notes, public.la_activities, public.la_runs, public.la_settings to service_role;
create index on public.la_notes(lead_id);
create index on public.la_activities(lead_id);
