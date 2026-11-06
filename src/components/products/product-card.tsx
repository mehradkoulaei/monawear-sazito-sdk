"use client";
import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProductListItem } from "@sazito/client-sdk";
import { QuickViewModal } from "./quick-view-modal";
import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "./product-image";
import { summarize } from "@/lib/product";
import { cn, formatNumber, formatPrice, toPath } from "@/lib/utils";

export function ProductCard({ product, priority, className }: { product: ProductListItem; priority?: boolean; className?: string }) {
  const s = summarize(product);
  const { add, busy } = useCart();
  const [pick, setPick] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const imgs = product.images ?? [];
  const href = toPath(product.url);
  const needsForm = !!product.dynamicFormId;

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!s.available) return;
    if (s.singleVariantId && !needsForm) await add(s.singleVariantId, 1);
    else if (!needsForm) setPick(true);
    else window.location.assign(href);
  };

  return (
    <article
      className={cn("product-card group relative flex flex-col h-full", className)}
      onMouseEnter={() => {
        if (!hovered && imgs[1]) setHovered(true);
      }}
    >
      <div className="product-card-media relative">
        <Link href={href} className="block" aria-label={product.name}>
          <div className="product-card-photo relative aspect-[3/4] overflow-hidden rounded-xl bg-[#faf7f8] border border-border/40">
            <ProductImage
              src={imgs[0]?.url}
              alt={imgs[0]?.alt || product.name}
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
              priority={priority}
              className={cn("product-card-image", imgs[1] && "product-card-primary")}
            />
            {imgs[1] && hovered && (
              <ProductImage
                src={imgs[1].url}
                alt={imgs[1].alt || product.name}
                sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
                className="product-card-image product-card-secondary"
              />
            )}
            {!s.available && (
              <div className="absolute start-2 top-2 z-10">
                <span className="inline-flex items-center rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  ناموجود
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="product-card-copy flex flex-1 flex-col justify-between pt-3">
        <div className="space-y-1">
          <h3 className="min-h-[38px] md:min-h-[42px]">
            <Link
              href={href}
              className="product-card-title line-clamp-2 text-xs md:text-[13px] font-normal leading-relaxed text-foreground transition-colors hover:text-burgundy"
            >
              {product.name}
            </Link>
          </h3>
          <div className="product-card-prices flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs md:text-sm font-semibold text-burgundy">{formatPrice(s.price)}</span>
            {s.originalPrice && s.discount > 0 && (
              <span className="text-[11px] md:text-xs text-muted-foreground/70 line-through">
                {formatPrice(s.originalPrice)}
              </span>
            )}
          </div>
          {s.colors.length > 0 && (
            <div className="product-card-colors flex items-center gap-1.5 pt-0.5" aria-label="رنگ‌ها">
              {s.colors.slice(0, 5).map((c) => (
                <span
                  key={c.label}
                  title={c.label}
                  className="h-3 w-3 rounded-full border border-black/15 shadow-2xs"
                  style={{ background: c.hex }}
                />
              ))}
              {s.colors.length > 5 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{formatNumber(s.colors.length - 5)}
                </span>
              )}
            </div>
          )}
        </div>

        {s.available ? (
          <button
            type="button"
            onClick={quickAdd}
            disabled={busy}
            aria-label={`افزودن ${product.name} به سبد`}
            className={cn(
              "product-card-add mt-2.5 flex h-9 md:h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-2 text-xs font-medium text-foreground transition-colors duration-150 hover:border-burgundy hover:bg-burgundy hover:text-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
              busy && "cursor-wait opacity-80"
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{busy ? "در حال افزودن..." : "افزودن به سبد"}</span>
          </button>
        ) : (
          <div className="mt-2.5 flex h-9 md:h-10 w-full items-center justify-center rounded-lg border border-border/40 bg-muted/20 px-2 text-xs font-medium text-muted-foreground/60 select-none">
            <span>ناموجود</span>
          </div>
        )}
      </div>

      <QuickViewModal
        product={product}
        open={pick}
        onOpenChange={setPick}
      />
    </article>
  );
}
