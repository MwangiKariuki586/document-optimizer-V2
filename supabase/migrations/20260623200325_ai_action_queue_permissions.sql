grant usage on schema pgmq to service_role;
grant execute on function pgmq.send(text, jsonb, integer) to service_role;
grant execute on function pgmq.read(text, integer, integer, jsonb) to service_role;
grant execute on function pgmq.archive(text, bigint) to service_role;

revoke usage on schema pgmq from anon, authenticated;

grant select, insert, update, delete on table
  pgmq.q_ai_actions,
  pgmq.a_ai_actions
to service_role;

grant usage, select on sequence pgmq.q_ai_actions_msg_id_seq to service_role;
