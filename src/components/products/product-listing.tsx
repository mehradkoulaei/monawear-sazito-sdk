import { Suspense } from "react";
import type { CategoryTreeNode, ProductListItem, ProductTaxonomyFacet } from "@sazito/client-sdk";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";
import { HorizontalFilterBar, type CurrentCategoryInfo } from "./horizontal-filter-bar";
import { EmptyState } from "@/components/state";
import { PAGE_SIZE, type SP } from "@/lib/listing";

/** Shared listing layout: modern horizontal filter bar with taxonomy, full-width grid, pagination, empty state. */
export function ProductListing({
  products,
  total,
  page,
  basePath,
  sp,
  showSort = true,
  categoriesTree = [],
  currentCategory,
  taxonomyFacets = [],
}: {
  products: ProductListItem[];
  total: number;
  page: number;
  basePath: string;
  sp: SP;
  showSort?: boolean;
  categoriesTree?: CategoryTreeNode[];
  currentCategory?: CurrentCategoryInfo;
  taxonomyFacets?: ProductTaxonomyFacet[];
}) {
  return (
    <div className="container pb-12">
      <Suspense fallback={null}>
        <HorizontalFilterBar
          categoriesTree={categoriesTree}
          currentCategory={currentCategory}
          total={total}
          showSort={showSort}
          taxonomyFacets={taxonomyFacets}
        />
      </Suspense>

      {products.length === 0 ? (
        <EmptyState
          title="محصولی پیدا نشد"
          text="فیلترها را تغییر دهید یا پاک کنید."
          href={basePath}
          cta="پاک کردن همه فیلترها"
        />
      ) : (
        <ProductGrid products={products} />
      )}

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath={basePath} sp={sp} />
    </div>
  );
}
