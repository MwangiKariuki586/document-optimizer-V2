alter table public.ai_requests
  drop constraint if exists ai_requests_action_check;

alter table public.ai_requests
  add constraint ai_requests_action_check
  check (
    action in (
      'improvement_scan',
      'proofread_correct',
      'improve_readability',
      'tone_alignment',
      'structure_flow',
      'summarize_shorten',
      'translate_document',
      'optimize',
      'improve_clarity',
      'fix_grammar',
      'rewrite',
      'summarize',
      'translate',
      'tone_analyze',
      'seo_analyze',
      'simplify_language'
    )
  );
