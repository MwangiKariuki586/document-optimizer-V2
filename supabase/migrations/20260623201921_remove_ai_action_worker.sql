drop function if exists public.archive_ai_action_message(bigint);
drop function if exists public.read_ai_action_queue(integer, integer);
drop function if exists public.enqueue_ai_action(uuid, jsonb, integer);

do $$
begin
  if exists (
    select 1 from pgmq.meta where queue_name = 'ai_actions'
  ) then
    perform pgmq.drop_queue('ai_actions');
  end if;
end;
$$;

update public.ai_requests
set status = 'failed',
    error_message = coalesce(
      error_message,
      'AI action was cancelled while removing background processing.'
    ),
    completed_at = coalesce(completed_at, now())
where status = 'queued';

drop index if exists public.ai_requests_active_user_idx;

alter table public.ai_requests
  drop constraint if exists ai_requests_attempt_count_check,
  drop constraint if exists ai_requests_status_check,
  drop column if exists queue_message_id,
  drop column if exists attempt_count;

alter table public.ai_requests
  add constraint ai_requests_status_check
  check (status in ('pending', 'running', 'completed', 'failed'));
