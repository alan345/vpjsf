import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
};

const buildHref = (
  basePath: string,
  page: number,
  query?: Record<string, string | undefined>
) => {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
};

export const Pagination = ({
  page,
  totalPages,
  basePath,
  query,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link
          href={buildHref(basePath, page - 1, query)}
          rel="prev"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
        >
          ‹ Précédent
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, p, query)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
              : "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          }
        >
          {p}
        </Link>
      ))}

      {page < totalPages && (
        <Link
          href={buildHref(basePath, page + 1, query)}
          rel="next"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
        >
          Suivant ›
        </Link>
      )}
    </nav>
  );
};
