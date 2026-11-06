"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Eye, Loader2, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ProductListItem } from "@sazito/client-sdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductImage } from "./product-image";
import { useCart } from "@/components/cart/cart-provider";
import { optionGroups, variantAvailable, variantLabel, variantMatches } from "@/lib/product";
import { cn, discountPercent, formatNumber, formatPrice, toPath } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const ProductSuperzoom = dynamic(() =>
  import("./product-superzoom").then((module) => module.ProductSuperzoom)
);

interface QuickViewModalProps {
  product: ProductListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { add, busy: cartBusy } = useCart();
  const [adding, setAdding] = React.useState(false);

  const variants = React.useMemo(
    () => (product.variants ?? []).filter((v) => v.enabled),
    [product.variants]
  );
  const images = React.useMemo(() => product.images ?? [], [product.images]);
  const groups = React.useMemo(() => optionGroups(variants), [variants]);
  const href = toPath(product.url);

  const [sel, setSel] = React.useState<Record<string, string>>({});
  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(null);
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  // Sync initial state when dialog opens or product changes
  React.useEffect(() => {
    if (!open) {
      setLightbox(false);
      return;
    }
    const initialVariant = variants.find(variantAvailable) ?? variants[0];
    if (initialVariant) {
      setSelectedVariantId(initialVariant.id);
      const nextSel: Record<string, string> = {};
      if (groups.length > 0) {
        for (const g of groups) {
          const a = initialVariant.attributes?.find(
            (x) => x.name === g.name && (x.attributeType === "differentiator" || !x.attributeType)
          );
          if (a) {
            nextSel[g.name] = typeof a.value === "string" ? a.value : a.value?.value ?? "";
          }
        }
      }
      setSel(nextSel);
      setQty(Math.max(1, initialVariant.minOrderQuantity || 1));

      if (initialVariant.imageId) {
        const found = images.findIndex((im) => im.id === initialVariant.imageId);
        setImgIdx(found >= 0 ? found : 0);
      } else {
        setImgIdx(0);
      }
    }
  }, [open, variants, groups, images]);

  // Derive chosen variant
  const chosenVariant = React.useMemo(() => {
    if (groups.length > 0) {
      return variants.find((v) => variantMatches(v, sel)) ?? variants[0];
    }
    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) ?? variants[0];
    }
    return variants[0];
  }, [groups.length, variants, sel, selectedVariantId]);

  // Sync image when chosen variant has an associated imageId
  React.useEffect(() => {
    if (!chosenVariant?.imageId) return;
    const found = images.findIndex((im) => im.id === chosenVariant.imageId);
    if (found >= 0) setImgIdx(found);
  }, [chosenVariant?.imageId, images]);

  const min = chosenVariant?.minOrderQuantity || 1;
  const max = chosenVariant?.hasMaxOrder
    ? chosenVariant.maxOrderQuantity
    : chosenVariant?.isStockManaged
    ? chosenVariant.stockQuantity
    : 99;

  const isAvailable = !!chosenVariant && variantAvailable(chosenVariant);
  const price = chosenVariant?.price;
  const originalPrice = chosenVariant?.originalPrice;
  const pct = discountPercent(price, originalPrice);
  const needsForm = !!product.dynamicFormId || !!chosenVariant?.dynamicFormId;

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.min(Math.max(prev + delta, min), Math.max(min, max || 1)));
  };

  const handleAddToCart = async () => {
    if (!chosenVariant || !isAvailable || adding || cartBusy) return;
    setAdding(true);
    try {
      const ok = await add(chosenVariant.id, qty);
      if (ok) {
        onOpenChange(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleOptionSelect = (groupName: string, value: string) => {
    const nextSel = { ...sel, [groupName]: value };
    setSel(nextSel);
    const matched = variants.find((v) => variantMatches(v, nextSel));
    if (matched) {
      setSelectedVariantId(matched.id);
      setQty(Math.max(1, matched.minOrderQuantity || 1));
    }
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={product.name}
        hideTitle
        className="block w-[94%] max-w-md md:max-w-3xl lg:max-w-4xl h-[86vh] md:h-auto md:max-h-[90vh] p-3.5 sm:p-5 md:p-6 rounded-2xl border border-border/80 shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] md:gap-7 h-full md:h-auto justify-between md:justify-start md:items-start">
          {/* Gallery Column */}
          <div className="flex flex-col gap-2 md:gap-3 flex-1 min-h-0 md:flex-initial md:w-full">
            <div className="group/image relative flex-1 md:flex-initial md:aspect-square w-full min-h-[180px] overflow-hidden rounded-xl border border-border/70 bg-white">
              {/* Clickable Image Area for Fullscreen Zoom */}
              <button
                type="button"
                onClick={() => {
                  if (images.length > 0) setLightbox(true);
                }}
                className="relative block h-full w-full cursor-zoom-in text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                aria-label={`بزرگ‌نمایی تصویر ${formatNumber(imgIdx + 1)} از ${formatNumber(images.length)}: ${product.name}`}
              >
                <ProductImage
                  src={images[imgIdx]?.url}
                  alt={images[imgIdx]?.alt || product.name}
                  sizes="(min-width: 1024px) 480px, (min-width: 768px) 420px, 92vw"
                  priority
                  className="product-card-image p-2 transition-transform duration-300 group-hover/image:scale-[1.02]"
                />
              </button>

              {images.length > 1 && (
                <>
                  {/* Previous Button (Right in RTL) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute start-2 md:start-3 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/90 text-foreground/80 shadow-xs backdrop-blur-xs transition-all duration-200 hover:bg-white hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                    aria-label="تصویر قبلی"
                  >
                    <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  </button>

                  {/* Next Button (Left in RTL) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute end-2 md:end-3 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/90 text-foreground/80 shadow-xs backdrop-blur-xs transition-all duration-200 hover:bg-white hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                    aria-label="تصویر بعدی"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  </button>

                  {/* Image dots pagination - exactly matching product page pdp-gallery-dots */}
                  <div
                    className="pdp-gallery-dots !flex absolute bottom-2.5 left-2.5 md:left-3 z-10"
                    role="group"
                    aria-label="انتخاب تصویر محصول"
                    dir="ltr"
                  >
                    {images.map((im, i) => (
                      <button
                        type="button"
                        key={im.id ?? i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgIdx(i);
                        }}
                        aria-label={`نمایش تصویر ${formatNumber(i + 1)}`}
                        aria-current={i === imgIdx}
                        className={cn("pdp-gallery-dot", i === imgIdx && "is-active")}
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Superzoom trigger icon taken from product page */}
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(true);
                  }}
                  className="pdp-superzoom-trigger !flex !opacity-90 hover:!opacity-100 !pointer-events-auto absolute max-md:!top-auto max-md:!left-auto max-md:!bottom-2.5 max-md:!right-2.5 md:!top-3 md:!left-3 md:!bottom-auto md:!right-auto z-10 h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white/95 text-foreground/80 shadow-xs border border-border/50 backdrop-blur-xs transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                  aria-label="نمایش تمام‌صفحهٔ تصاویر محصول"
                  title="بزرگ‌نمایی تصویر"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/zoom-default.svg" width={18} height={18} alt="" aria-hidden="true" className="shrink-0" />
                </button>
              )}

              {/* Status Badge on Image */}
              {!isAvailable ? (
                <div className="absolute start-2.5 top-2.5 md:start-3 md:top-3 z-10">
                  <span className="inline-flex items-center rounded-md bg-zinc-900/80 px-2 py-0.5 md:px-2.5 md:py-1 text-[11px] md:text-xs font-medium text-white backdrop-blur-xs">
                    ناموجود
                  </span>
                </div>
              ) : pct > 0 ? (
                <div className="absolute start-2.5 top-2.5 md:start-3 md:top-3 z-10">
                  <span className="inline-flex items-center rounded-md bg-burgundy px-2 py-0.5 md:px-2.5 md:py-1 text-[11px] md:text-xs font-semibold text-white shadow-xs">
                    %{formatNumber(pct)} تخفیف
                  </span>
                </div>
              ) : null}
            </div>

            {/* Thumbnail preview row */}
            {images.length > 1 && (
              <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
                {images.map((im, i) => (
                  <button
                    key={im.id ?? i}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    className={cn(
                      "relative h-9 w-9 md:h-14 md:w-14 shrink-0 overflow-hidden rounded-lg border bg-white p-0.5 md:p-1 transition-all duration-200 active:scale-[0.97]",
                      i === imgIdx
                        ? "border-2 border-burgundy opacity-100"
                        : "border-border/70 opacity-60 hover:opacity-100"
                    )}
                    aria-label={`مشاهده تصویر ${formatNumber(i + 1)}`}
                  >
                    <ProductImage
                      src={im.url}
                      alt={im.alt || product.name}
                      sizes="56px"
                      className="product-card-image"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info & Options Column */}
          <div className="flex flex-col justify-between gap-2.5 md:gap-4 shrink-0 md:shrink">
            <div className="space-y-2 md:space-y-4">
              {/* Product Title */}
              <div className="pe-7 md:pe-8">
                <h2 className="text-sm md:text-lg font-semibold text-foreground leading-snug line-clamp-1 md:line-clamp-2">
                  <Link
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className="transition-colors hover:text-burgundy"
                  >
                    {product.name}
                  </Link>
                </h2>
              </div>

              {/* Price Banner */}
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2 md:p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-0.5">
                  <span className="text-[10px] md:text-[11px] font-medium text-muted-foreground">قیمت:</span>
                  <div className="flex items-baseline gap-1 md:gap-1.5">
                    <span className="text-base sm:text-lg md:text-2xl font-bold text-burgundy tabular-nums">
                      {price !== undefined ? formatNumber(price) : "—"}
                    </span>
                    <span className="text-[11px] md:text-sm font-medium text-burgundy/80">
                      {siteConfig.currencyLabel}
                    </span>
                  </div>
                </div>

                {originalPrice && pct > 0 && (
                  <div className="flex items-center md:flex-col md:items-end gap-1.5 md:gap-1">
                    <span className="rounded-full bg-burgundy px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-white shadow-2xs">
                      %{formatNumber(pct)} تخفیف
                    </span>
                    <span className="text-[11px] md:text-xs text-muted-foreground/70 line-through tabular-nums">
                      {formatPrice(originalPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Options selection */}
              {groups.length > 0 ? (
                <div className="space-y-1.5 md:space-y-2.5">
                  {groups.map((g) => (
                    <div key={g.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground text-xs md:text-sm">
                            انتخاب {g.name}:
                          </span>
                          <span className="font-medium text-burgundy text-xs md:text-sm">
                            {sel[g.name] || "انتخاب نشده"}
                          </span>
                        </div>
                        <Link
                          href="/size-guide"
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-burgundy transition-colors"
                        >
                          <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} />
                          <span>راهنمای سایز</span>
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {g.values.map((v) => {
                          const isSelected = sel[g.name] === v.value;
                          const isAvail = variants.some(
                            (variant) =>
                              variantAvailable(variant) &&
                              variantMatches(variant, { ...sel, [g.name]: v.value })
                          );

                          return (
                            <button
                              key={v.value}
                              type="button"
                              disabled={!isAvail}
                              onClick={() => handleOptionSelect(g.name, v.value)}
                              className={cn(
                                "inline-flex h-8 min-w-10 md:h-10 md:min-w-14 items-center justify-center rounded-lg md:rounded-xl border px-3 md:px-4 text-xs md:text-sm font-semibold tabular-nums shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40",
                                isSelected
                                  ? "border-burgundy bg-burgundy text-white shadow-xs"
                                  : isAvail
                                  ? "border-border/80 bg-card text-foreground/90 hover:border-burgundy/50 hover:bg-burgundy/5 hover:text-burgundy"
                                  : "cursor-not-allowed border-dashed border-border/50 bg-muted/20 text-muted-foreground/40 line-through"
                              )}
                              aria-pressed={isSelected}
                            >
                              {v.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : variants.length > 1 ? (
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-foreground text-xs md:text-sm">
                      انتخاب مدل:
                    </label>
                    <Link
                      href="/size-guide"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-burgundy transition-colors"
                    >
                      <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span>راهنمای سایز</span>
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {variants.map((v) => {
                      const isSelected = v.id === chosenVariant?.id;
                      const isAvail = variantAvailable(v);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setQty(Math.max(1, v.minOrderQuantity || 1));
                          }}
                          className={cn(
                            "inline-flex h-8 min-w-10 md:h-10 md:min-w-14 items-center justify-center rounded-lg md:rounded-xl border px-3 md:px-4 text-xs md:text-sm font-semibold tabular-nums shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40",
                            isSelected
                              ? "border-burgundy bg-burgundy text-white shadow-xs"
                              : isAvail
                              ? "border-border/80 bg-card text-foreground/90 hover:border-burgundy/50 hover:bg-burgundy/5 hover:text-burgundy"
                              : "cursor-not-allowed border-dashed border-border/50 bg-muted/20 text-muted-foreground/40 line-through"
                          )}
                          aria-pressed={isSelected}
                        >
                          <span>{variantLabel(v)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Stock status indicator */}
              <div className="text-[11px] md:text-xs">
                {isAvailable ? (
                  chosenVariant?.isStockManaged && chosenVariant.stockQuantity <= 3 ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      تنها {formatNumber(chosenVariant.stockQuantity)} عدد در انبار باقی مانده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      موجود در انبار مونا و آماده ارسال
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    این گزینه در حال حاضر ناموجود است
                  </span>
                )}
              </div>

              {/* Mobile 1-line Reassurance Strip */}
              <div className="flex md:hidden items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1 text-[10px] text-foreground/85 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>بسته‌بندی محرمانه</span>
                </span>
                <span className="text-border/80">•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>ضمانت کیفیت</span>
                </span>
                <span className="text-border/80">•</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>ارسال سریع</span>
                </span>
              </div>

              {/* Desktop Full 3-row Reassurance Card */}
              <div className="hidden md:block rounded-xl border border-border/70 bg-muted/25 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground/85 font-medium">
                  <ShieldCheck className="h-4 w-4 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>بسته‌بندی ۱۰۰٪ محرمانه و بدون درج نام کالا</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/85 font-medium">
                  <Sparkles className="h-4 w-4 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>ضمانت اصالت، کیفیت پارچه و دوخت تمیز مونا</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/85 font-medium">
                  <Truck className="h-4 w-4 text-burgundy shrink-0" strokeWidth={1.8} />
                  <span>ارسال سریع با پست پیشتاز به تمام نقاط کشور</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-1.5 md:space-y-2.5 pt-0.5 md:pt-1">
              <div className="flex items-center gap-2 md:gap-2.5">
                {/* Counter Stepper */}
                <div className="flex h-10 md:h-11 items-center rounded-lg md:rounded-xl border border-border/80 bg-card shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    disabled={qty <= min || !isAvailable || adding || cartBusy}
                    className="flex h-full w-8 md:w-9 items-center justify-center text-foreground/75 transition-colors hover:bg-muted/70 hover:text-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 rounded-s-lg md:rounded-s-xl"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>

                  <span className="flex h-full w-8 md:w-9 items-center justify-center text-xs md:text-sm font-semibold tabular-nums text-foreground select-none">
                    {formatNumber(qty)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    disabled={qty >= max || !isAvailable || adding || cartBusy}
                    className="flex h-full w-8 md:w-9 items-center justify-center text-foreground/75 transition-colors hover:bg-muted/70 hover:text-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 rounded-e-lg md:rounded-e-xl"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>

                {/* Main CTA */}
                {needsForm ? (
                  <Link
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className="flex h-10 md:h-11 flex-1 items-center justify-center gap-2 rounded-lg md:rounded-xl bg-burgundy px-4 text-xs md:text-sm font-semibold text-white shadow-xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-burgundy/90 active:scale-[0.98]"
                  >
                    <span>تکمیل مشخصات و خرید</span>
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isAvailable || adding || cartBusy}
                    className={cn(
                      "flex h-10 md:h-11 flex-1 items-center justify-center gap-2 rounded-lg md:rounded-xl bg-burgundy px-4 text-xs md:text-sm font-semibold text-white shadow-xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-burgundy/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                      (adding || cartBusy) && "cursor-wait"
                    )}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>در حال افزودن...</span>
                      </>
                    ) : isAvailable ? (
                      <>
                        <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                        <span>افزودن به سبد خرید</span>
                      </>
                    ) : (
                      <span>ناموجود</span>
                    )}
                  </button>
                )}
              </div>

              {/* View Full Product Details */}
              <Link
                href={href}
                onClick={() => onOpenChange(false)}
                className="flex h-8 md:h-10 w-full items-center justify-center gap-1.5 rounded-lg md:rounded-xl border border-border/80 bg-muted/20 text-xs md:text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:border-border hover:bg-muted/60 active:scale-[0.98]"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                <span>مشاهده جزئیات کامل محصول</span>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {lightbox && images.length > 0 && (
      <ProductSuperzoom
        images={images}
        index={imgIdx}
        name={product.name}
        onIndexChange={setImgIdx}
        onClose={() => setLightbox(false)}
      />
    )}
  </>
);
}
