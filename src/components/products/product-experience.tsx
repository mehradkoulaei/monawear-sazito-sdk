"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Loader2 } from "lucide-react";
import type { DynamicForm, Product, ProductVariant } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
const ProductSuperzoom = dynamic(() => import("./product-superzoom").then((module) => module.ProductSuperzoom));
import { useCart } from "@/components/cart/cart-provider";
import { DynamicFormFields, validateForm, type FormValues } from "./dynamic-form";
import { SizeGuideDialog } from "./size-guide";
import { ProductImage } from "./product-image";
import { useToast } from "@/components/toast";
import { optionGroups, variantAvailable, variantLabel, variantMatches } from "@/lib/product";
import { cn, discountPercent, formatNumber, formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
  productId?: number;
  path: string;
  form: DynamicForm | null;
  sizeGuideHtml: string;
  showStockNumber: boolean;
  details?: React.ReactNode;
}

export function ProductExperience({ product, productId, path, form, sizeGuideHtml, showStockNumber, details }: Props) {
  const variants = (product.variants ?? []).filter((v) => v.enabled);
  const images = React.useMemo(() => product.images ?? [], [product.images]);
  const groups = React.useMemo(() => optionGroups(variants), [variants]);
  const { add, busy } = useCart();
  const { toast } = useToast();

  // initial selection: first available variant's differentiators
  const initial = React.useMemo(() => {
    const v = variants.find(variantAvailable) ?? variants[0];
    const sel: Record<string, string> = {};
    if (v) for (const g of groups) {
      const a = v.attributes.find((x) => x.name === g.name && x.attributeType === "differentiator");
      if (a) sel[g.name] = typeof a.value === "string" ? a.value : a.value.value;
    }
    return sel;
  }, [variants, groups]);
  const [sel, setSel] = React.useState<Record<string, string>>(initial);
  const [qty, setQty] = React.useState(1);
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const galleryRef = React.useRef<HTMLDivElement>(null);
  const activeImageRef = React.useRef(idx);
  const [formValues, setFormValues] = React.useState<FormValues>({});

  React.useEffect(() => { activeImageRef.current = idx; }, [idx]);
  React.useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const observer = new ResizeObserver(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        gallery.scrollTo({ left: gallery.clientWidth * activeImageRef.current, behavior: "auto" });
      }
    });
    observer.observe(gallery);
    return () => observer.disconnect();
  }, []);

  const variant: ProductVariant | undefined = groups.length
    ? variants.find((v) => variantMatches(v, sel))
    : variants.length === 1 ? variants[0] : undefined;
  const [manualVariantId, setManualVariantId] = React.useState<number | null>(null);
  const chosen = groups.length ? variant : variants.find((v) => v.id === manualVariantId) ?? variants[0];

  // switch gallery to the variant image
  React.useEffect(() => {
    if (!chosen?.imageId) return;
    const i = images.findIndex((im) => im.id === chosen.imageId);
    if (i >= 0) {
      setIdx(i);
      const gallery = galleryRef.current;
      if (gallery && window.matchMedia("(max-width: 1023px)").matches) gallery.scrollTo({ left: gallery.clientWidth * i, behavior: "auto" });
    }
  }, [chosen?.imageId, images]);

  // recently viewed (UI-only; stores what Sazito returned for products this browser viewed)
  React.useEffect(() => {
    if (!productId) return;
    try {
      const key = "mw_recent";
      const list = JSON.parse(localStorage.getItem(key) || "[]") as Array<{ id: number }>;
      const cheapest = [...variants].sort((a, b) => a.price - b.price)[0];
      const next = [{ id: productId, name: product.name, url: path, image: images[0]?.url ?? "", price: cheapest?.price ?? 0 }, ...list.filter((x) => x.id !== productId)].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(next));
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const optionAvailable = (name: string, value: string) =>
    variants.some((v) => variantAvailable(v) && variantMatches(v, { ...sel, [name]: value }));

  const min = chosen?.minOrderQuantity || 1;
  const max = chosen?.hasMaxOrder ? chosen.maxOrderQuantity : chosen?.isStockManaged ? chosen.stockQuantity : 99;
  React.useEffect(() => { setQty((q) => Math.min(Math.max(q, min), Math.max(min, max || 1))); }, [min, max]);

  const available = !!chosen && variantAvailable(chosen);
  const pct = discountPercent(chosen?.price, chosen?.originalPrice);

  const onAdd = async () => {
    if (!chosen) return toast("لطفاً گزینه‌های محصول را انتخاب کنید.", "error");
    if (form) {
      const err = validateForm(form, formValues);
      if (err) return toast(err, "error");
    }
    await add(chosen.id, qty, form ? (formValues as Record<string, unknown>) : undefined);
  };

  const selectImage = (index: number) => {
    setIdx(index);
    const gallery = galleryRef.current;
    if (gallery && window.matchMedia("(max-width: 1023px)").matches) {
      gallery.scrollTo({ left: gallery.clientWidth * index, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  };
  const openImage = (index: number) => { setIdx(index); setLightbox(true); };

  return (
    <div className="product-detail container">
      <div className="pdp-gallery" aria-label="گالری تصاویر محصول">
        <div className="pdp-gallery-grid no-scrollbar" ref={galleryRef} dir="ltr"
          onScroll={(event) => {
            if (window.matchMedia("(min-width: 1024px)").matches) return;
            const gallery = event.currentTarget;
            const next = Math.max(0, Math.min(images.length - 1, Math.round(gallery.scrollLeft / Math.max(gallery.clientWidth, 1))));
            if (next !== idx) setIdx(next);
          }}>
          {images.map((image, i) => (
            <div key={image.id} className="pdp-gallery-cell">
              <button type="button" className="pdp-gallery-image" onClick={() => openImage(i)}
                aria-label={`بزرگ‌نمایی تصویر ${formatNumber(i + 1)} از ${formatNumber(images.length)}: ${product.name}`}>
                <ProductImage src={image.url} alt={image.alt || product.name} sizes="(min-width:1024px) 28vw, 100vw" priority={i === 0} />
              </button>
            </div>
          ))}
          {!images.length && <div className="pdp-gallery-empty"><ProductImage alt={product.name} sizes="50vw" /></div>}
          {!!images.length && <button type="button" className="pdp-superzoom-trigger" onClick={() => openImage(0)} aria-label="نمایش تمام‌صفحهٔ تصاویر محصول">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/zoom-default.svg" width={24} height={24} alt="" aria-hidden="true" />
          </button>}
        </div>
        {images.length > 1 && <div className="pdp-gallery-dots" role="group" aria-label="انتخاب تصویر محصول" dir="ltr">
          {images.map((image, i) => <button type="button" key={image.id} onClick={() => selectImage(i)} aria-label={`نمایش تصویر ${formatNumber(i + 1)}`} aria-current={i === idx} className={cn("pdp-gallery-dot", i === idx && "is-active")}><span /></button>)}
        </div>}
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="pdp-heading">
        <p className="pdp-brand" dir="ltr">MONA WEAR</p>
        <h1>{product.name}</h1>
        <div className="pdp-price flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {chosen ? (
            <>
              <span className="pdp-current-price">{formatPrice(chosen.price)}</span>
              {pct > 0 && chosen.originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(chosen.originalPrice)}</span>}
            </>
          ) : <span className="text-sm text-muted-foreground">برای دیدن قیمت، گزینه‌ها را انتخاب کنید.</span>}
        </div>
        </div>

        <div className="pdp-selection-heading"><h2>انتخاب شما</h2><SizeGuideDialog html={sizeGuideHtml} /></div>

        {groups.map((g) => (
          <fieldset key={g.name} className="pdp-option-group">
            <legend className="mb-2 text-sm font-semibold">{g.name}: <span className="font-normal text-muted-foreground">{sel[g.name]}</span></legend>
            <div className="flex flex-wrap gap-2">
              {g.values.map((v) => {
                const on = sel[g.name] === v.value;
                const ok = optionAvailable(g.name, v.value);
                return v.hex ? (
                  <button type="button" key={v.value} onClick={() => setSel({ ...sel, [g.name]: v.value })} title={v.value} aria-label={ok ? v.value : `${v.value}، ناموجود برای این ترکیب`} aria-pressed={on} className={cn("pdp-color-option", on && "is-selected", !ok && "is-unavailable")}>
                    <span className="block h-full w-full rounded-full" style={{ background: v.hex }} />
                    {!ok && <span className="absolute inset-0 grid place-items-center text-lg text-foreground/60">⁄</span>}
                  </button>
                ) : (
                  <button type="button" key={v.value} onClick={() => setSel({ ...sel, [g.name]: v.value })} aria-label={ok ? v.value : `${v.value}، ناموجود برای این ترکیب`} aria-pressed={on} className={cn("pdp-size-option", on && "is-selected", !ok && "is-unavailable")}>{v.value}</button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {!groups.length && variants.length > 1 && (
          <fieldset className="pdp-option-group">
            <legend className="mb-2 text-sm font-semibold">گزینه‌ها</legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => <button type="button" key={v.id} disabled={!variantAvailable(v)} onClick={() => setManualVariantId(v.id)} aria-pressed={chosen?.id === v.id} className={cn("pdp-size-option disabled:opacity-40", chosen?.id === v.id && "is-selected")}>{variantLabel(v)}</button>)}
            </div>
          </fieldset>
        )}

        {form && <div className="mt-6"><DynamicFormFields form={form} values={formValues} onChange={setFormValues} /></div>}

        <div className="pdp-stock" aria-live="polite">
          {chosen ? (available ? (
            <span className="text-emerald-700">{showStockNumber && chosen.isStockManaged ? `موجود (${formatNumber(chosen.stockQuantity)} عدد)` : chosen.isStockManaged && chosen.stockQuantity <= 3 ? `تنها ${formatNumber(chosen.stockQuantity)} عدد باقی مانده` : "موجود"}</span>
          ) : <span className="text-destructive">این گزینه ناموجود است.</span>) : groups.length > 0 ? <span className="text-destructive">این ترکیب موجود نیست.</span> : null}
        </div>

        {/* Purchase Section (Desktop & Mobile) */}
        <div className="pdp-purchase-container mt-6">
          {/* Desktop Purchase Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quantity Stepper */}
            <div
              className="inline-flex items-center h-12 rounded-xl border border-border/80 bg-muted/20 p-1 transition-all duration-300 hover:border-foreground/30 shrink-0"
              role="group"
              aria-label="تعداد محصول"
            >
              <button
                type="button"
                aria-label="کاهش تعداد"
                disabled={qty <= min || !available || busy}
                onClick={() => setQty((q) => Math.max(min, q - 1))}
                className="h-10 w-10 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-card hover:text-foreground active:scale-90 transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                className="min-w-10 px-1 text-center font-bold text-sm text-foreground tabular-nums select-none"
                aria-live="polite"
              >
                {formatNumber(qty)}
              </span>
              <button
                type="button"
                aria-label="افزایش تعداد"
                disabled={qty >= Math.max(min, max || 1) || !available || busy}
                onClick={() => setQty((q) => Math.min(Math.max(min, max || 1), q + 1))}
                className="h-10 w-10 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-card hover:text-foreground active:scale-90 transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart CTA Button */}
            <Button
              size="lg"
              variant="burgundy"
              disabled={!available || busy}
              onClick={onAdd}
              className={cn(
                "h-12 flex-1 rounded-xl text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xs",
                available
                  ? "bg-burgundy text-white hover:bg-burgundy/90 active:scale-[0.99]"
                  : "bg-muted text-muted-foreground border border-border/80 cursor-not-allowed hover:bg-muted"
              )}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال افزودن…</span>
                </span>
              ) : available ? (
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>افزودن به سبد خرید</span>
                </span>
              ) : (
                <span>ناموجود</span>
              )}
            </Button>
          </div>

          {/* Quick Reassurance Badges on Desktop */}
          <div className="hidden md:flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-burgundy" />
              <span>ضمانت اصالت و سلامت کالا</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-burgundy" />
              <span>ارسال سریع و محرمانه</span>
            </span>
          </div>

          {/* Mobile Fixed Purchase Dock */}
          <div className="pdp-purchase md:hidden fixed inset-x-0 bottom-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
            {/* Price Info on Mobile */}
            {chosen ? (
              <div className="flex flex-col items-start justify-center min-w-0">
                <span className="text-base font-bold text-burgundy truncate leading-tight">
                  {formatPrice(chosen.price)}
                </span>
                {pct > 0 && chosen.originalPrice && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-muted-foreground line-through">
                      {formatPrice(chosen.originalPrice)}
                    </span>
                    <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      {formatNumber(pct)}٪
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">انتخاب گزینه‌ها</span>
            )}

            {/* Stepper + CTA on Mobile */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="inline-flex items-center h-11 rounded-xl border border-border/80 bg-muted/30 p-0.5"
                role="group"
                aria-label="تعداد محصول"
              >
                <button
                  type="button"
                  aria-label="کاهش تعداد"
                  disabled={qty <= min || !available || busy}
                  onClick={() => setQty((q) => Math.max(min, q - 1))}
                  className="h-9 w-8 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-card active:scale-90 transition-all disabled:opacity-25"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold tabular-nums" aria-live="polite">
                  {formatNumber(qty)}
                </span>
                <button
                  type="button"
                  aria-label="افزایش تعداد"
                  disabled={qty >= Math.max(min, max || 1) || !available || busy}
                  onClick={() => setQty((q) => Math.min(Math.max(min, max || 1), q + 1))}
                  className="h-9 w-8 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-card active:scale-90 transition-all disabled:opacity-25"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                size="default"
                variant="burgundy"
                disabled={!available || busy}
                onClick={onAdd}
                className={cn(
                  "h-11 px-4 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xs",
                  available
                    ? "bg-burgundy text-white hover:bg-burgundy/90 active:scale-95"
                    : "bg-muted text-muted-foreground border border-border/80 cursor-not-allowed"
                )}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>در حال افزودن…</span>
                  </span>
                ) : available ? (
                  <span className="inline-flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>افزودن به سبد</span>
                  </span>
                ) : (
                  <span>ناموجود</span>
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="pdp-services">
          <p><Truck size={19} strokeWidth={1.4} aria-hidden="true" /><span>روش‌های ارسال را هنگام ثبت سفارش ببینید.</span></p>
          <p><ShieldCheck size={19} strokeWidth={1.4} aria-hidden="true" /><span>پرداخت از طریق درگاه‌های فعال فروشگاه</span></p>
          <Link href="/order-tracking">پیگیری سفارش <ChevronLeft size={14} aria-hidden="true" /></Link>
        </div>
        {details}
        {chosen?.sku && <p className="pdp-sku">کد محصول: <span dir="ltr">{chosen.sku}</span></p>}
      </div>

      {lightbox && <ProductSuperzoom images={images} index={idx} name={product.name} onIndexChange={selectImage} onClose={() => setLightbox(false)} />}
    </div>
  );
}
