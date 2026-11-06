import type { Metadata } from "next";
import Link from "next/link";
import type { ProductCategory, ProductListItem } from "@sazito/client-sdk";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductListing } from "@/components/products/product-listing";
import { ErrorState } from "@/components/state";
import { getCategories, getListingProducts, searchSite } from "@/lib/sazito/services";
import { PAGE_SIZE, filterByTaxonomy, hasTaxonomyFilter, parseListing, type SP } from "@/lib/listing";
import { siteConfig } from "@/config/site";
import { toPath } from "@/lib/utils";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<SP> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim();
  const title = q
    ? `جستجوی «${q}»`
    : sp.discounted
    ? "محصولات تخفیف‌دار"
    : sp.sort === "newest"
    ? "تازه‌های مونا"
    : sp.sort === "best-selling"
    ? "پرفروش‌های مونا"
    : "همه محصولات";
  return {
    title,
    description: q
      ? `نتایج جستجوی ${q} در پوشاک مونا`
      : "مدل‌های پوشاک مونا را ببینید؛ قیمت، تصاویر و گزینه‌های هر محصول را مقایسه کنید.",
    robots: Object.keys(sp).length ? { index: false, follow: true } : undefined,
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim();
  const state = parseListing(sp);

  if (q) {
    const d = siteConfig.priceDivisor;
    const isTaxonomyActive = hasTaxonomyFilter(state);

    let items: ProductListItem[] = [];
    let total = 0;
    let cats: ProductCategory[] = [];
    let pages: Array<{ url: string; name: string }> = [];

    if (!isTaxonomyActive) {
      const [r, catsTree] = await Promise.all([
        searchSite(q, {
          page: state.page,
          pageSize: PAGE_SIZE,
          minPrice: state.priceMin ? state.priceMin * d : undefined,
          maxPrice: state.priceMax ? state.priceMax * d : undefined,
        }),
        getCategories(),
      ]);

      if (r.error) return <ErrorState error={r.error} />;
      items = r.data.products.items;
      total = r.data.products.total;
      cats = r.data.productCategories.items;
      pages = [...r.data.cmsPages.items, ...r.data.blogPages.items];

      return (
        <>
          <Breadcrumbs items={[{ name: `جستجوی «${q}»` }]} />
          <header className="listing-heading mb-6">
            <div className="container">
              <h1 className="text-3xl font-bold">نتایج جستجوی «{q}»</h1>
              {(cats.length > 0 || pages.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <Link
                      key={c.url}
                      href={toPath(c.url)}
                      className="rounded-lg border border-border/80 bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-burgundy/60 hover:text-burgundy"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {pages.map((p) => (
                    <Link
                      key={p.url}
                      href={toPath(p.url)}
                      className="rounded-lg border border-dashed border-border/80 bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-burgundy/60 hover:text-burgundy"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </header>
          <ProductListing
            products={items}
            total={total}
            page={state.page}
            basePath="/search"
            sp={sp}
            showSort={false}
            categoriesTree={catsTree.data?.tree?.treeStructure?.nodes ?? []}
          />
        </>
      );
    } else {
      const [r1, catsTree] = await Promise.all([
        searchSite(q, {
          page: 1,
          pageSize: 100,
          minPrice: state.priceMin ? state.priceMin * d : undefined,
          maxPrice: state.priceMax ? state.priceMax * d : undefined,
        }),
        getCategories(),
      ]);

      if (r1.error) return <ErrorState error={r1.error} />;
      let allItems = r1.data.products.items;
      const searchTotal = r1.data.products.total;
      cats = r1.data.productCategories.items;
      pages = [...r1.data.cmsPages.items, ...r1.data.blogPages.items];

      if (searchTotal > 100) {
        const maxPages = Math.min(5, Math.ceil(searchTotal / 100));
        const rest = await Promise.all(
          Array.from({ length: maxPages - 1 }, (_, i) =>
            searchSite(q, {
              page: i + 2,
              pageSize: 100,
              minPrice: state.priceMin ? state.priceMin * d : undefined,
              maxPrice: state.priceMax ? state.priceMax * d : undefined,
            })
          )
        );
        for (const res of rest) {
          if (res.data?.products?.items) {
            allItems = allItems.concat(res.data.products.items);
          }
        }
      }

      const filtered = filterByTaxonomy(allItems, {
        size: state.size,
        color: state.color,
        pattern: state.pattern,
      });
      total = filtered.length;
      items = filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

      return (
        <>
          <Breadcrumbs items={[{ name: `جستجوی «${q}»` }]} />
          <header className="listing-heading mb-6">
            <div className="container">
              <h1 className="text-3xl font-bold">نتایج جستجوی «{q}»</h1>
              {(cats.length > 0 || pages.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <Link
                      key={c.url}
                      href={toPath(c.url)}
                      className="rounded-lg border border-border/80 bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-burgundy/60 hover:text-burgundy"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {pages.map((p) => (
                    <Link
                      key={p.url}
                      href={toPath(p.url)}
                      className="rounded-lg border border-dashed border-border/80 bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-burgundy/60 hover:text-burgundy"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </header>
          <ProductListing
            products={items}
            total={total}
            page={state.page}
            basePath="/search"
            sp={sp}
            showSort={false}
            categoriesTree={catsTree.data?.tree?.treeStructure?.nodes ?? []}
          />
        </>
      );
    }
  }

  const [listingRes, catsTree] = await Promise.all([getListingProducts(state), getCategories()]);

  return (
    <>
      <Breadcrumbs items={[{ name: "همه محصولات" }]} />
      <header className="listing-heading mb-6">
        <div className="container">
          <h1 className="text-3xl font-bold md:text-4xl">
            {sp.discounted
              ? "محصولات تخفیف‌دار"
              : state.sort === "newest"
              ? "تازه‌های مونا"
              : state.sort === "best-selling"
              ? "پرفروش‌های مونا"
              : "همه محصولات"}
          </h1>
        </div>
      </header>
      {listingRes.error ? (
        <ErrorState error={listingRes.error} />
      ) : (
        <ProductListing
          products={listingRes.items}
          total={listingRes.total}
          page={state.page}
          basePath="/search"
          sp={sp}
          categoriesTree={catsTree.data?.tree?.treeStructure?.nodes ?? []}
          taxonomyFacets={listingRes.taxonomyFacets ?? []}
        />
      )}
    </>
  );
}
