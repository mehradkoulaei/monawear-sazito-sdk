"use client";
import Link from "next/link";
import { ProductImage } from "@/components/products/product-image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";
import { attrValue } from "@/lib/product";
import { formatNumber, formatPrice, toPath } from "@/lib/utils";

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, update, remove, busy } = useCart();
  const items = cart?.items ?? [];
  return (
    <ul className="divide-y">
      {items.map((it) => {
        const max = it.product.hasMaxOrder ? it.product.maxOrderQuantity : undefined;
        return (
          <li key={it.id} className="flex gap-4 py-4">
            <Link href={toPath(it.product.url)} onClick={onNavigate} className="relative h-28 w-20 shrink-0 overflow-hidden bg-muted">
              {it.product.image?.url && <ProductImage src={it.product.image.url} alt={it.product.image.alt || it.product.name} sizes="80px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={toPath(it.product.url)} onClick={onNavigate} className="line-clamp-2 text-sm font-medium">{it.product.name}</Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {it.product.attributes.filter((a) => a.attributeType === "differentiator").map((a) => `${a.name}: ${attrValue(a)}`).join("، ")}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <div className="flex items-center border">
                  <button aria-label="کاهش" disabled={busy || it.quantity <= 1} onClick={() => update(it.id, it.productVariantId, it.quantity - 1)} className="grid h-8 w-8 place-items-center disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-sm" aria-live="polite">{formatNumber(it.quantity)}</span>
                  <button aria-label="افزایش" disabled={busy || (max !== undefined && it.quantity >= max)} onClick={() => update(it.id, it.productVariantId, it.quantity + 1)} className="grid h-8 w-8 place-items-center disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="text-sm font-semibold">{formatPrice(it.lineTotal)}</div>
                <button aria-label="حذف" disabled={busy} onClick={() => remove(it.id, it.productVariantId)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
