grant select, insert, update, delete on table
  pgmq.q_document_ingestion,
  pgmq.a_document_ingestion
to service_role;
grant usage, select on sequence pgmq.q_document_ingestion_msg_id_seq to service_role;
