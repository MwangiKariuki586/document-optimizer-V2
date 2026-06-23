do $$
begin
  if not exists (
    select 1 from pgmq.meta where queue_name = 'ai_actions'
  ) then
    perform pgmq.create('ai_actions');
  end if;
end;
$$;

alter table public.ai_requests
  add column if not exists queue_message_id bigint,
  add column if not exists attempt_count integer not null default 0;

alter table public.ai_requests
  drop constraint if exists ai_requests_status_check;

alter table public.ai_requests
  add constraint ai_requests_status_check
  check (status in ('pending', 'queued', 'running', 'completed', 'failed'));

alter table public.ai_requests
  drop constraint if exists ai_requests_attempt_count_check;

alter table public.ai_requests
  add constraint ai_requests_attempt_count_check
  check (attempt_count >= 0);

create index if not exists ai_requests_active_user_idx
  on public.ai_requests(user_id, created_at desc)
  where status in ('queued', 'running');

create or replace function public.enqueue_ai_action(
  p_request_id uuid,
  p_message jsonb,
  p_delay_seconds integer default 0
)
returns bigint
language plpgsql
set search_path = public, pgmq
as $$
declare
  v_message_id bigint;
begin
  select queue_message_id into v_message_id
  from public.ai_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'AI_REQUEST_NOT_FOUND';
  end if;

  if v_message_id is not null then
    return v_message_id;
  end if;

  select pgmq.send(
    'ai_actions',
    p_message,
    greatest(p_delay_seconds, 0)
  ) into v_message_id;

  update public.ai_requests
  set queue_message_id = v_message_id,
      status = 'queued',
      error_message = null
  where id = p_request_id;

  return v_message_id;
end;
$$;

create or replace function public.read_ai_action_queue(
  p_visibility_timeout integer default 120,
  p_quantity integer default 1
)
returns table(
  message_id bigint,
  read_count integer,
  enqueued_at timestamptz,
  visible_at timestamptz,
  message jsonb
)
language sql
set search_path = public, pgmq
as $$
  select msg_id, read_ct, enqueued_at, vt, message
  from pgmq.read('ai_actions', p_visibility_timeout, p_quantity);
$$;

create or replace function public.archive_ai_action_message(p_message_id bigint)
returns boolean
language sql
set search_path = public, pgmq
as $$
  select pgmq.archive('ai_actions', p_message_id);
$$;

revoke all on function public.enqueue_ai_action(uuid, jsonb, integer)
  from public, anon, authenticated;
revoke all on function public.read_ai_action_queue(integer, integer)
  from public, anon, authenticated;
revoke all on function public.archive_ai_action_message(bigint)
  from public, anon, authenticated;

grant execute on function public.enqueue_ai_action(uuid, jsonb, integer)
  to service_role;
grant execute on function public.read_ai_action_queue(integer, integer)
  to service_role;
grant execute on function public.archive_ai_action_message(bigint)
  to service_role;
