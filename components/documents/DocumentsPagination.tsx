type DocumentsPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "…", totalPages);
  } else if (current >= totalPages - 3) {
    pages.push(
      1,
      "…",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(1, "…", current - 1, current, current + 1, "…", totalPages);
  }

  return pages;
}

export function DocumentsPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: DocumentsPaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0 || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-text-secondary">
        Showing{" "}
        <span className="font-medium text-text-primary">{from}</span>
        {" "}to{" "}
        <span className="font-medium text-text-primary">{to}</span>
        {" "}of{" "}
        <span className="font-medium text-text-primary">{total}</span>
        {" "}documents
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            p === "…" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-text-muted"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                aria-current={p === page ? "page" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition ${
                  p === page
                    ? "bg-accent text-accent-foreground"
                    : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
