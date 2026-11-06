import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ProductListItem } from "@sazito/client-sdk";
import { ProductCard } from "./product-card";

/** Horizontal, scroll-snapping product rail (no client JS beyond the cards). */
export function ProductRail({ title, eyebrow, href, products }: { title: string; eyebrow?: string; href?: string; products: ProductListItem[] }) {
  if (!products.length) return null;
  return (
    <section className="container section-space" aria-label={title}>
      <div className="section-heading">
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        </div>
        {href && <Link href={href} className="section-link">مشاهده همه<ChevronLeft className="h-4 w-4" /></Link>}
      </div>
      <div className="product-rail no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {products.map((p) => <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]"><ProductCard product={p} /></div>)}
      </div>
    </section>
  );
}
