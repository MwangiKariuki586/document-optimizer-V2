create table public.user_onboarding (
  user_id text primary key,
  onboarding_version integer not null default 1,
  welcome_dismissed_at timestamptz,
  dismissed_tips text[] not null default '{}'::text[],
  checklist_dismissed_at timestamptz,
  replay_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_onboarding_version_check check (onboarding_version > 0)
);

create trigger user_onboarding_set_updated_at
before update on public.user_onboarding
for each row execute function public.set_updated_at();

alter table public.user_onboarding enable row level security;

revoke all on table public.user_onboarding from anon, authenticated;
grant all on table public.user_onboarding to service_role;
