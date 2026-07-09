create or replace function public.consume_rate_limit(
  p_rule_key text,
  p_subject_key text,
  p_max_count integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz,
  limit_count integer
)
language plpgsql
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_request_count integer;
  v_allowed boolean;
begin
  if p_rule_key is null or btrim(p_rule_key) = '' then
    raise exception 'INVALID_RATE_LIMIT_RULE';
  end if;

  if p_subject_key is null or btrim(p_subject_key) = '' then
    raise exception 'INVALID_RATE_LIMIT_SUBJECT';
  end if;

  if p_max_count <= 0 or p_window_seconds <= 0 then
    raise exception 'INVALID_RATE_LIMIT_CONFIG';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  perform pg_advisory_xact_lock(
    hashtextextended(p_rule_key || ':' || p_subject_key || ':' || v_window_start::text, 0)
  );

  select request_count into v_request_count
  from public.rate_limit_counters
  where rule_key = p_rule_key
    and subject_key = p_subject_key
    and window_start = v_window_start
  for update;

  if v_request_count is null then
    insert into public.rate_limit_counters (
      rule_key,
      subject_key,
      window_start,
      request_count
    )
    values (
      p_rule_key,
      p_subject_key,
      v_window_start,
      1
    );

    v_request_count := 1;
    v_allowed := true;
  elsif v_request_count < p_max_count then
    update public.rate_limit_counters
    set
      request_count = request_count + 1,
      updated_at = now()
    where rule_key = p_rule_key
      and subject_key = p_subject_key
      and window_start = v_window_start
    returning request_count into v_request_count;

    v_allowed := true;
  else
    v_allowed := false;
  end if;

  return query
  select
    v_allowed as allowed,
    greatest(p_max_count - v_request_count, 0) as remaining,
    v_window_start + make_interval(secs => p_window_seconds) as reset_at,
    p_max_count as limit_count;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
  to service_role;
