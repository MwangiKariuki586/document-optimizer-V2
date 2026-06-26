alter table public.suggestions
  drop constraint if exists suggestions_type_check;

alter table public.suggestions
  add constraint suggestions_type_check
  check (
    type in (
      'grammar',
      'clarity',
      'tone',
      'conciseness',
      'structure',
      'formatting',
      'seo',
      'style'
    )
  );
