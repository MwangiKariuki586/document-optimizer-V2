type PageHeaderProps = {
  actions?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({
  actions,
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-2xl md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-[28px] font-bold leading-9 text-text-primary md:text-[40px] md:leading-[48px]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-[26px] text-text-secondary">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
