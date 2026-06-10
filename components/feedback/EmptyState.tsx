import { FileText } from "lucide-react";

type EmptyStateProps = {
  action?: React.ReactNode;
  description: string;
  icon?: React.ReactNode;
  title: string;
};

export function EmptyState({
  action,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card-soft">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent-lighter text-accent">
        {icon ?? <FileText className="size-6" />}
      </div>
      <h2 className="mt-5 text-lg font-semibold leading-7 text-text-primary">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-[22px] text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
