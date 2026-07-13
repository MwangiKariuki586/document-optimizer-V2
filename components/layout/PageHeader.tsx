type PageHeaderProps = {
  actions?: React.ReactNode;
  compactOnMobile?: boolean;
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({
  actions,
  compactOnMobile = false,
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col rounded-2xl md:flex-row md:items-end md:justify-between ${compactOnMobile ? "gap-2 md:gap-5" : "gap-5"}`}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={`${compactOnMobile ? "mt-1 text-2xl leading-8 md:mt-2" : "mt-2 text-[28px] leading-9"} font-bold text-text-primary md:text-[40px] md:leading-[48px]`}>
          {title}
        </h1>
        <p className={`${compactOnMobile ? "hidden sm:block" : "block"} mt-3 text-base leading-[26px] text-text-secondary`}>
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
