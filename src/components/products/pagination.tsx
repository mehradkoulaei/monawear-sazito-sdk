import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery, type SP } from "@/lib/listing";
import { cn, formatNumber } from "@/lib/utils";

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  sp,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  sp: SP;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const nums = new Set(
    [1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages)
  );
  const list = [...nums].sort((a, b) => a - b);
  const href = (n: number) =>
    `${basePath}${buildQuery(sp, { page: n === 1 ? undefined : String(n) })}`;

  return (
    <nav
      id="plp-pagination"
      className="mt-12 flex items-center justify-center gap-2 select-none"
      aria-label="صفحه‌بندی محصولات"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground/75 shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} />
        </Link>
      )}

      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - list[i - 1] > 1 && (
            <span className="px-1 text-sm font-semibold text-muted-foreground/50 select-none">
              …
            </span>
          )}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold tabular-nums shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40",
              n === page
                ? "border-burgundy bg-burgundy text-white shadow-xs"
                : "border-border/80 bg-card/80 text-foreground/90 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy"
            )}
          >
            {formatNumber(n)}
          </Link>
        </span>
      ))}

      {page < pages && (
        <Link
          href={href(page + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground/75 shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          aria-label="صفحه بعد"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
        </Link>
      )}
    </nav>
  );
}
