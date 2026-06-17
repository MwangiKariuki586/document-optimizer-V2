type CometSpinnerProps = {
  className?: string;
};

export function CometSpinner({ className = "size-4" }: CometSpinnerProps) {
  return (
    <span
      className={`relative inline-flex ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current" />
    </span>
  );
}
