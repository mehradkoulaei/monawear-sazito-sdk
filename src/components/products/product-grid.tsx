import type { ProductListItem } from "@sazito/client-sdk";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10">
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-2.5">
          <div className="aspect-[3/4] animate-pulse rounded-xl bg-muted/60" />
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted/60" />
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted/60" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted/40" />
        </div>
      ))}
    </div>
  );
}
