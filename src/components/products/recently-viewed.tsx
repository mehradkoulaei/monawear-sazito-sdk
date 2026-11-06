"use client";
import * as React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/products/product-image";
import { formatPrice } from "@/lib/utils";

interface Item { id: number; name: string; url: string; image: string; price: number }

export function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const [items, setItems] = React.useState<Item[]>([]);
  React.useEffect(() => {
    try { setItems((JSON.parse(localStorage.getItem("mw_recent") || "[]") as Item[]).filter((i) => i.id !== excludeId).slice(0, 6)); } catch { /* ignore */ }
  }, [excludeId]);
  if (!items.length) return null;
  return (
    <section className="container py-12" aria-label="بازدیدهای اخیر">
      <h2 className="mb-6 text-xl font-bold">بازدیدهای اخیر شما</h2>
      <ul className="no-scrollbar flex gap-4 overflow-x-auto">
        {items.map((i) => (
          <li key={i.id} className="w-36 shrink-0 md:w-44">
            <Link href={i.url}>
              <div className="relative aspect-[3/4] bg-muted">{i.image && <ProductImage src={i.image} alt={i.name} sizes="176px" className="object-cover" />}</div>
              <p className="mt-2 line-clamp-1 text-sm">{i.name}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(i.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
