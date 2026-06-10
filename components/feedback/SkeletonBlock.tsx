type SkeletonBlockProps = {
  className?: string;
  lines?: number;
};

export function SkeletonBlock({
  className = "",
  lines = 3,
}: SkeletonBlockProps) {
  const widthClasses = ["w-[90%]", "w-[78%]", "w-[66%]", "w-[54%]"];

  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-card-soft ${className}`}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="h-4 w-1/3 rounded-full bg-surface-tertiary" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded-full bg-surface-tertiary ${
              widthClasses[index % widthClasses.length]
            }`}
          />
        ))}
      </div>
    </div>
  );
}
