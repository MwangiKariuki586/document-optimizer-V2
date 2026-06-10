import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  action?: React.ReactNode;
  description: string;
  title: string;
};

export function ErrorState({ action, description, title }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-error-light bg-error-muted p-8 text-center shadow-card-soft">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-surface text-error">
        <AlertCircle className="size-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold leading-7 text-error-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-[22px] text-error-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
