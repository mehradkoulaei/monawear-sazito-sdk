import { jsonLd } from "@/lib/seo";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { absoluteUrl, cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  const all: Crumb[] = [{ name: "صفحه اصلی", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };

  return (
    <nav aria-label="مسیر صفحه" className={cn("container py-3", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs text-muted-foreground">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronLeft
                className="h-3 w-3 shrink-0 text-muted-foreground/50"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
            {c.href && i < all.length - 1 ? (
              <Link
                href={c.href}
                className="transition-colors hover:text-burgundy"
              >
                {c.name}
              </Link>
            ) : (
              <span className="font-medium text-foreground/80" aria-current="page">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(ld) }}
      />
    </nav>
  );
}
