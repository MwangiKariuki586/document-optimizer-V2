import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

type InlineAlertVariant = "error" | "info" | "success" | "warning";

type InlineAlertProps = {
  children: React.ReactNode;
  title: string;
  variant?: InlineAlertVariant;
};

const variantClasses: Record<
  InlineAlertVariant,
  {
    container: string;
    icon: string;
    Icon: typeof Info;
  }
> = {
  error: {
    container: "bg-error-muted text-error-foreground",
    icon: "text-error",
    Icon: AlertCircle,
  },
  info: {
    container: "bg-info-muted text-info-foreground",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    container: "bg-success-muted text-success-foreground",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    container: "bg-warning-muted text-warning-foreground",
    icon: "text-warning",
    Icon: TriangleAlert,
  },
};

export function InlineAlert({
  children,
  title,
  variant = "info",
}: InlineAlertProps) {
  const { container, icon, Icon } = variantClasses[variant];

  return (
    <div className={`flex gap-3 rounded-xl p-4 ${container}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${icon}`} />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-1 text-sm leading-[22px]">{children}</div>
      </div>
    </div>
  );
}
