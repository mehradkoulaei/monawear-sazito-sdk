import { jsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import type { CategoryTreeNode, ProductCategory } from "@sazito/client-sdk";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ErrorState } from "@/components/state";
import { ProductListing } from "./product-listing";
import { getCategories, getListingProducts } from "@/lib/sazito/services";
import { PAGE_SIZE, parseListing, type SP } from "@/lib/listing";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatNumber, toPath } from "@/lib/utils";

function findNode(
  nodes: CategoryTreeNode[],
  id: number,
  trail: CategoryTreeNode[] = []
): { node: CategoryTreeNode; trail: CategoryTreeNode[] } | null {
  for (const n of nodes) {
    if (n.entityId === id) return { node: n, trail };
    const r = findNode(n.children ?? [], id, [...trail, n]);
    if (r) return r;
  }
  return null;
}

export async function CategoryPage({
  category,
  categoryId,
  path,
  sp,
}: {
  category: ProductCategory;
  categoryId: number;
  path: string;
  sp: SP;
}) {
  const state = parseListing(sp);
  const [res, cats] = await Promise.all([
    getListingProducts(state, categoryId),
    getCategories(),
  ]);
  const found = cats.data
    ? findNode(cats.data.tree?.treeStructure?.nodes ?? [], categoryId)
    : null;
  const children = found?.node.children ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            url: absoluteUrl(path),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: res.items.map((product, i) => ({
                "@type": "ListItem",
                position: (state.page - 1) * PAGE_SIZE + i + 1,
                name: product.name,
                url: absoluteUrl(toPath(product.url)),
              })),
            },
          }),
        }}
      />

      <Breadcrumbs
        items={[
          ...(found?.trail ?? []).map((t) => ({
            name: t.entity.name,
            href: toPath(t.entity.url),
          })),
          { name: category.name },
        ]}
        className="pb-1 pt-4"
      />

      <header className="container pb-4 pt-1">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {category.name}
            </h1>
            {res.total > 0 && (
              <span className="text-xs font-normal text-muted-foreground font-mono">
                ({formatNumber(res.total)} محصول)
              </span>
            )}
          </div>
        </div>

        {category.description && (
          <div
            className="prose-sm mt-2 max-w-3xl text-xs md:text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(category.description) }}
          />
        )}

        {children.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground ml-1">
              زیردسته‌ها:
            </span>
            {children.map((c) => (
              <Link
                key={c.id}
                href={toPath(c.entity.url)}
                className="inline-flex items-center rounded-lg border border-border/70 bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors duration-150 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy active:scale-[0.99]"
              >
                {c.entity.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {res.error ? (
        <ErrorState error={res.error} />
      ) : (
        <ProductListing
          products={res.items}
          total={res.total}
          page={state.page}
          basePath={path}
          sp={sp}
          categoriesTree={cats.data?.tree?.treeStructure?.nodes ?? []}
          currentCategory={{ id: categoryId, name: category.name, url: path }}
          taxonomyFacets={res.taxonomyFacets ?? []}
        />
      )}
    </>
  );
}

export { PAGE_SIZE };
