"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
  RotateCcw,
  FolderTree,
  ChevronLeft,
  ArrowUpDown,
  Palette,
} from "lucide-react";
import type { CategoryTreeNode, ProductTaxonomyFacet } from "@sazito/client-sdk";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SORT_OPTIONS, toEnglishDigits } from "@/lib/listing";
import { siteConfig } from "@/config/site";
import { cn, formatNumber, toPath } from "@/lib/utils";

export interface CurrentCategoryInfo {
  id?: number;
  name?: string;
  url?: string;
}

interface HorizontalFilterBarProps {
  categoriesTree?: CategoryTreeNode[];
  currentCategory?: CurrentCategoryInfo;
  total?: number;
  showSort?: boolean;
  taxonomyFacets?: ProductTaxonomyFacet[];
}

export const PRICE_PRESETS = [
  { label: "زیر ۱ میلیون", min: undefined, max: "1000000" },
  { label: "۱ تا ۱.۳ میلیون", min: "1000000", max: "1300000" },
  { label: "۱.۳ تا ۱.۶ میلیون", min: "1300000", max: "1600000" },
  { label: "بالای ۱.۵ میلیون", min: "1500000", max: undefined },
];

export const POPULAR_SIZES = ["فری سایز", "S", "M", "L", "XL", "2XL", "پلاس سایز"];

export const TAXONOMY_COLORS = [
  { label: "مشکی", value: "مشکی", hex: "#18181b", border: false },
  { label: "قرمز", value: "قرمز", hex: "#dc2626", border: false },
  { label: "سفید", value: "سفید", hex: "#ffffff", border: true },
  { label: "صورتی", value: "صورتی", hex: "#f472b6", border: false },
  { label: "سرخابی", value: "سرخابی", hex: "#e11d48", border: false },
  { label: "آبی", value: "آبی", hex: "#2563eb", border: false },
  { label: "سبز", value: "سبز", hex: "#16a34a", border: false },
  { label: "طوسی", value: "طوسی", hex: "#71717a", border: false },
  { label: "پلنگی", value: "پلنگی", hex: "#d97706", border: false },
  { label: "گلبهی", value: "گلبهی", hex: "#fb923c", border: false },
  { label: "کرم", value: "کرم", hex: "#fef08a", border: true },
  { label: "بنفش", value: "بنفش", hex: "#9333ea", border: false },
  { label: "زرشکی", value: "زرشکی", hex: "#881337", border: false },
];

function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const push = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const q = new URLSearchParams(sp.toString());
      q.delete("page");
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined && v !== "") q.set(k, v);
        else q.delete(k);
      }
      const s = q.toString();
      const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
      const target = s ? `${currentPath}?${s}` : currentPath;
      router.push(target, { scroll: false });
    },
    [pathname, router, sp]
  );

  return { sp, push, pathname, router };
}

/** Hook to detect clicks outside a ref container */
function useClickOutside<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return ref;
}

export function HorizontalFilterBar({
  categoriesTree = [],
  currentCategory,
  total,
  showSort = true,
  taxonomyFacets = [],
}: HorizontalFilterBarProps) {
  const { sp, push } = useNav();

  // Active popover tracker: 'category' | 'price' | 'size' | 'color' | 'sort' | `tax-${id}` | null
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const toggleMenu = (menu: string) => {
    setActiveMenu((curr) => (curr === menu ? null : menu));
  };
  const closeMenu = React.useCallback(() => setActiveMenu(null), []);

  const popoverRef = useClickOutside<HTMLDivElement>(activeMenu !== null, closeMenu);

  // Price popover state
  const [minInput, setMinInput] = React.useState(sp.get("min") ?? "");
  const [maxInput, setMaxInput] = React.useState(sp.get("max") ?? "");

  React.useEffect(() => {
    setMinInput(sp.get("min") ?? "");
    setMaxInput(sp.get("max") ?? "");
  }, [sp]);

  const activeSort = sp.get("sort") ?? "newest";
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "جدیدترین";

  const isInStock = sp.get("stock") === "1";
  const isDiscounted = sp.get("discounted") === "1";
  const activeSize = sp.get("size");
  const activeColor = sp.get("color");

  const isPriceActive = Boolean(sp.get("min") || sp.get("max"));

  // Extract active taxonomy from search params
  const activeTaxonomy = React.useMemo(() => {
    const result: Record<string, string[]> = {};
    sp.forEach((val, key) => {
      const m = key.match(/^taxonomy\[([^\]]+)\]$/);
      if (m && val) {
        result[m[1]] = val.split(",").filter(Boolean);
      }
    });
    const raw = sp.get("taxonomy");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object") {
          for (const [k, v] of Object.entries(obj)) {
            if (Array.isArray(v)) result[k] = v.map(String);
            else if (typeof v === "string") result[k] = [v];
          }
        }
      } catch {}
    }
    return result;
  }, [sp]);

  const colorFacet = React.useMemo(() => {
    return taxonomyFacets.find((f) => f.isColor || f.attribute.name.includes("رنگ"));
  }, [taxonomyFacets]);

  const otherTaxonomyFacets = React.useMemo(() => {
    return taxonomyFacets.filter((f) => f !== colorFacet);
  }, [taxonomyFacets, colorFacet]);

  const toggleTaxonomyValue = React.useCallback(
    (attrId: string, valId: string) => {
      const curr = activeTaxonomy[attrId] || [];
      const next = curr.includes(valId)
        ? curr.filter((id) => id !== valId)
        : [...curr, valId];
      const key = `taxonomy[${attrId}]`;
      if (colorFacet && attrId === colorFacet.attribute.id) {
        push({ [key]: next.length ? next.join(",") : undefined, color: undefined });
      } else {
        push({ [key]: next.length ? next.join(",") : undefined });
      }
    },
    [activeTaxonomy, colorFacet, push]
  );

  // Calculate active filters count for the "More Filters" badge
  const activeTaxonomyCount = Object.values(activeTaxonomy).reduce(
    (acc, vals) => acc + vals.length,
    0
  );

  let activeFiltersCount = activeTaxonomyCount;
  if (isInStock) activeFiltersCount += 1;
  if (isDiscounted) activeFiltersCount += 1;
  if (isPriceActive) activeFiltersCount += 1;
  if (activeSize) activeFiltersCount += 1;
  if (activeColor && !colorFacet) activeFiltersCount += 1;
  if (activeSort !== "newest") activeFiltersCount += 1;

  // Active filter chip descriptors
  const chips: Array<{ label: string; onRemove: () => void }> = [];
  if (sp.get("min")) {
    chips.push({
      label: `از ${formatNumber(Number(sp.get("min")))} تومان`,
      onRemove: () => push({ min: undefined }),
    });
  }
  if (sp.get("max")) {
    chips.push({
      label: `تا ${formatNumber(Number(sp.get("max")))} تومان`,
      onRemove: () => push({ max: undefined }),
    });
  }
  if (isInStock) {
    chips.push({
      label: "فقط کالاهای موجود",
      onRemove: () => push({ stock: undefined }),
    });
  }
  if (isDiscounted) {
    chips.push({
      label: "فقط تخفیف‌دارها",
      onRemove: () => push({ discounted: undefined }),
    });
  }

  // Active taxonomy chips
  for (const [attrId, valIds] of Object.entries(activeTaxonomy)) {
    const facet = taxonomyFacets.find((f) => f.attribute.id === attrId);
    const attrName = facet?.attribute.name ?? "ویژگی";
    for (const valId of valIds) {
      const valObj = facet?.values.find((v) => v.id === valId);
      const valName = valObj?.name ?? valId;
      chips.push({
        label: `${attrName}: ${valName}`,
        onRemove: () => toggleTaxonomyValue(attrId, valId),
      });
    }
  }

  if (activeColor && !colorFacet) {
    chips.push({
      label: `رنگ: ${activeColor}`,
      onRemove: () => push({ color: undefined }),
    });
  }
  if (activeSize) {
    chips.push({
      label: `سایز: ${activeSize}`,
      onRemove: () => push({ size: undefined }),
    });
  }
  if (activeSort !== "newest") {
    chips.push({
      label: `مرتب‌سازی: ${activeSortLabel}`,
      onRemove: () => push({ sort: undefined }),
    });
  }

  const handleClearAll = () => {
    const taxClears: Record<string, undefined> = {};
    sp.forEach((_, key) => {
      if (key === "taxonomy" || key.startsWith("taxonomy[")) {
        taxClears[key] = undefined;
      }
    });
    push({
      min: undefined,
      max: undefined,
      stock: undefined,
      discounted: undefined,
      size: undefined,
      color: undefined,
      sort: undefined,
      ...taxClears,
    });
    setMinInput("");
    setMaxInput("");
  };

  return (
    <section
      id="plp-horizontal-filter-bar"
      aria-label="فیلترها و مرتب‌سازی محصولات"
      className="mb-8 w-full select-none"
    >
      {/* Mobile Dedicated Filter & Sort Controls (< 768px) */}
      <div className="md:hidden space-y-2">
        {/* Top Control Bar: Filters Button + Sort Button */}
        <div className="flex items-center gap-2">
          {/* 1. Mobile Filter Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                  activeFiltersCount > 0
                    ? "border-burgundy/35 bg-burgundy/6 text-burgundy font-semibold"
                    : "border-border/60 bg-card/60 text-foreground/85 hover:border-border hover:bg-muted/30"
                )}
              >
                <SlidersHorizontal
                  className={cn("h-3.5 w-3.5 shrink-0", activeFiltersCount > 0 ? "text-burgundy" : "text-muted-foreground")}
                  strokeWidth={1.5}
                />
                <span>فیلترها</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy/15 px-1 text-[10px] font-semibold text-burgundy">
                    {formatNumber(activeFiltersCount)}
                  </span>
                )}
              </button>
            </SheetTrigger>

            {/* Mobile Filters Drawer Content */}
            <SheetContent side="start" title="فیلترها و مرتب‌سازی" className="flex flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6" dir="rtl">
                {/* 1. Taxonomy / Categories in Mobile Drawer */}
                {categoriesTree.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <FolderTree className="h-4 w-4 text-burgundy" />
                      <span>دسته‌بندی‌ها</span>
                    </h3>
                    <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-border/70 p-2 bg-muted/20">
                      <Link
                        href="/category/محصولات"
                        className="block rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        همه محصولات
                      </Link>
                      {categoriesTree.map((node) => {
                        const isSelected = currentCategory?.id === node.entityId;
                        return (
                          <div key={node.entityId || node.id} className="space-y-1">
                            <Link
                              href={toPath(node.entity?.url)}
                              className={cn(
                                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                                isSelected
                                  ? "bg-burgundy/10 font-semibold text-burgundy"
                                  : "text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span>{node.entity?.name}</span>
                              {node.entity?.productsCount !== undefined && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({formatNumber(node.entity.productsCount)})
                                </span>
                              )}
                            </Link>
                            {node.children?.length > 0 && (
                              <div className="mr-3 border-r-2 border-border/60 pr-2 space-y-1">
                                {node.children.map((c) => (
                                  <Link
                                    key={c.entityId || c.id}
                                    href={toPath(c.entity?.url)}
                                    className={cn(
                                      "block rounded-lg px-2 py-1 text-[11px]",
                                      currentCategory?.id === c.entityId
                                        ? "bg-burgundy/10 font-semibold text-burgundy"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                  >
                                    {c.entity?.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Status Toggles in Mobile Drawer */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">وضعیت کالا</h3>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium bg-card hover:bg-muted/50 transition-colors">
                      <span>فقط کالاهای موجود</span>
                      <input
                        type="checkbox"
                        checked={isInStock}
                        onChange={(e) => push({ stock: e.target.checked ? "1" : undefined })}
                        className="h-4 w-4 rounded-sm accent-[hsl(var(--burgundy))]"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium bg-card hover:bg-muted/50 transition-colors">
                      <span>فقط کالاهای تخفیف‌دار</span>
                      <input
                        type="checkbox"
                        checked={isDiscounted}
                        onChange={(e) => push({ discounted: e.target.checked ? "1" : undefined })}
                        className="h-4 w-4 rounded-sm accent-[hsl(var(--burgundy))]"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Price Range in Mobile Drawer */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    محدوده قیمت ({siteConfig.currencyLabel})
                  </h3>
                  <div className="mb-2.5 grid grid-cols-2 gap-1.5">
                    {PRICE_PRESETS.map((p) => {
                      const isPresetActive =
                        sp.get("min") === (p.min ?? null) && sp.get("max") === (p.max ?? null);
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => push({ min: p.min, max: p.max })}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center text-xs transition-colors",
                            isPresetActive
                              ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                              : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      inputMode="numeric"
                      placeholder="از قیمت"
                      aria-label="حداقل قیمت"
                      value={minInput}
                      onChange={(e) => setMinInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                      className="h-9 rounded-lg text-xs"
                    />
                    <span className="text-xs text-muted-foreground">–</span>
                    <Input
                      inputMode="numeric"
                      placeholder="تا قیمت"
                      aria-label="حداکثر قیمت"
                      value={maxInput}
                      onChange={(e) => setMaxInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                      className="h-9 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      className="h-9 flex-1 rounded-lg text-xs font-semibold"
                      onClick={() => push({ min: minInput || undefined, max: maxInput || undefined })}
                    >
                      اعمال قیمت
                    </Button>
                    {isPriceActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-lg text-xs text-muted-foreground hover:text-burgundy"
                        onClick={() => {
                          push({ min: undefined, max: undefined });
                          setMinInput("");
                          setMaxInput("");
                        }}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>

                {/* 4. Color Taxonomy in Mobile Drawer */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-burgundy" />
                      <span>{colorFacet?.attribute.name ?? "رنگ محصول"}</span>
                    </span>
                    {colorFacet && (activeTaxonomy[colorFacet.attribute.id]?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => push({ [`taxonomy[${colorFacet.attribute.id}]`]: undefined, color: undefined })}
                        className="text-[11px] font-normal text-burgundy hover:underline"
                      >
                        حذف فیلتر رنگ
                      </button>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {colorFacet
                      ? colorFacet.values.map((v) => {
                          const isSelected =
                            activeTaxonomy[colorFacet.attribute.id]?.includes(v.id) ||
                            activeColor === v.name;
                          const hex =
                            v.color ||
                            TAXONOMY_COLORS.find(
                              (c) => c.label === v.name || c.value === v.name
                            )?.hex ||
                            "#71717a";
                          const hasBorder = v.name === "سفید" || v.name === "کرم";
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleTaxonomyValue(colorFacet.attribute.id, v.id)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border p-2 text-xs font-medium transition-colors",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 text-burgundy font-semibold"
                                  : "border-border/70 bg-card text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 rounded-full",
                                  hasBorder && "border border-border/80"
                                )}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="truncate">{v.name}</span>
                              {isSelected && <Check className="mr-auto h-3.5 w-3.5 text-burgundy" />}
                            </button>
                          );
                        })
                      : TAXONOMY_COLORS.map((c) => {
                          const isSelected = activeColor === c.value || activeColor === c.label;
                          return (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => push({ color: isSelected ? undefined : c.value })}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border p-2 text-xs font-medium transition-colors",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 text-burgundy font-semibold"
                                  : "border-border/70 bg-card text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 rounded-full",
                                  c.border && "border border-border/80"
                                )}
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="truncate">{c.label}</span>
                              {isSelected && <Check className="mr-auto h-3.5 w-3.5 text-burgundy" />}
                            </button>
                          );
                        })}
                  </div>
                </div>

                {/* 4.5 Other Taxonomy Facets in Mobile Drawer (e.g. طرح, جنسیت, مدل) */}
                {otherTaxonomyFacets.map((facet) => {
                  const selectedVals = activeTaxonomy[facet.attribute.id] || [];
                  return (
                    <div key={facet.attribute.id}>
                      <h3 className="mb-2 text-sm font-semibold flex items-center justify-between text-foreground">
                        <span>{facet.attribute.name}</span>
                        {selectedVals.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              push({ [`taxonomy[${facet.attribute.id}]`]: undefined })
                            }
                            className="text-[11px] font-normal text-burgundy hover:underline"
                          >
                            حذف ({formatNumber(selectedVals.length)})
                          </button>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {facet.values.map((v) => {
                          const isSelected = selectedVals.includes(v.id);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleTaxonomyValue(facet.attribute.id, v.id)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                                  : "border-border/70 bg-card text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span>{v.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-burgundy" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* 5. Size Options in Mobile Drawer */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">سایز</h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {POPULAR_SIZES.map((sz) => {
                      const isSelected = activeSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => push({ size: isSelected ? undefined : sz })}
                          className={cn(
                            "rounded-lg border py-2 text-center text-xs font-medium transition-colors",
                            isSelected
                              ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                              : "border-border/70 bg-card text-foreground/80 hover:bg-muted"
                          )}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Sort Options in Mobile Drawer */}
                {showSort && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">مرتب‌سازی</h3>
                    <div className="space-y-1.5">
                      {SORT_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-xs transition-colors",
                            activeSort === opt.value
                              ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                              : "border-border/60 bg-card hover:bg-muted"
                          )}
                        >
                          <span>{opt.label}</span>
                          <input
                            type="radio"
                            name="drawer-sort-mobile"
                            value={opt.value}
                            checked={activeSort === opt.value}
                            onChange={() => push({ sort: opt.value === "newest" ? undefined : opt.value })}
                            className="accent-[hsl(var(--burgundy))]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="border-t border-border/80 p-4 flex items-center justify-between gap-3 bg-card">
                <SheetClose asChild>
                  <Button className="flex-1 h-11 rounded-xl text-xs font-semibold bg-burgundy text-white hover:bg-burgundy/90">
                    مشاهده نتایج
                    {total !== undefined && ` (${formatNumber(total)} محصول)`}
                  </Button>
                </SheetClose>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="rounded-xl text-xs text-muted-foreground hover:text-burgundy"
                  >
                    پاک کردن همه
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* 2. Mobile Quick Sort Sheet Trigger */}
          {showSort && (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                    activeSort && activeSort !== "newest"
                      ? "border-burgundy/35 bg-burgundy/6 text-burgundy font-semibold"
                      : "border-border/60 bg-card/60 text-foreground/85 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <span className="truncate">مرتب‌سازی: {activeSortLabel}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" title="مرتب‌سازی محصولات" className="rounded-t-2xl">
                <div className="space-y-1.5 p-4" dir="rtl">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = activeSort === opt.value;
                    return (
                      <SheetClose asChild key={opt.value}>
                        <button
                          type="button"
                          onClick={() => push({ sort: opt.value === "newest" ? undefined : opt.value })}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg p-2.5 text-xs font-medium transition-colors",
                            isSelected
                              ? "bg-burgundy/10 font-bold text-burgundy"
                              : "hover:bg-muted text-foreground/85"
                          )}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-burgundy" strokeWidth={1.5} />}
                        </button>
                      </SheetClose>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Row 2: Mobile Horizontal Swipeable Quick Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {/* Quick In-Stock Toggle Pill */}
          <button
            type="button"
            onClick={() => push({ stock: isInStock ? undefined : "1" })}
            className={cn(
              "inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors duration-150 active:scale-[0.99]",
              isInStock
                ? "border-burgundy/40 bg-burgundy/8 text-burgundy font-semibold"
                : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {isInStock && <Check className="h-3 w-3 text-burgundy" strokeWidth={1.5} />}
            <span>فقط موجودها</span>
          </button>

          {/* Quick Discounted Toggle Pill */}
          <button
            type="button"
            onClick={() => push({ discounted: isDiscounted ? undefined : "1" })}
            className={cn(
              "inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-medium transition-colors duration-150 active:scale-[0.99]",
              isDiscounted
                ? "border-burgundy/40 bg-burgundy/8 text-burgundy font-semibold"
                : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {isDiscounted && <Check className="h-3 w-3 text-burgundy" strokeWidth={1.5} />}
            <span>تخفیف‌دارها</span>
          </button>

          {/* Active filter chips on mobile */}
          {chips
            .filter((c) => !c.label.includes("موجود") && !c.label.includes("تخفیف"))
            .map((c) => (
              <span
                key={c.label}
                className="inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border border-burgundy/35 bg-burgundy/8 px-2 text-[11px] font-medium text-burgundy"
              >
                <span>{c.label}</span>
                <button
                  type="button"
                  onClick={c.onRemove}
                  className="p-0.5 hover:text-foreground"
                  aria-label={`حذف ${c.label}`}
                >
                  <X className="h-3 w-3" strokeWidth={1.5} />
                </button>
              </span>
            ))}

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-burgundy"
            >
              <RotateCcw className="h-2.5 w-2.5" strokeWidth={1.5} />
              <span>پاک کردن</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Desktop Filter Bar Container (>= 768px) */}
      <div
        ref={popoverRef}
        className="relative z-30 hidden md:flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/60 p-1.5 shadow-2xs backdrop-blur-sm"
      >
        {/* Left/Middle Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 py-0.5">
          {/* 1. Taxonomy / Categories Popover */}
          {categoriesTree.length > 0 && (
            <div className={cn("relative shrink-0", activeMenu === "category" && "z-50")}>
              <button
                type="button"
                onClick={() => toggleMenu("category")}
                aria-expanded={activeMenu === "category"}
                className={cn(
                  "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                  activeMenu === "category"
                    ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs"
                    : currentCategory?.name
                    ? "border-burgundy/30 bg-card text-foreground hover:bg-muted/60"
                    : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
                )}
              >
                <FolderTree
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    activeMenu === "category" || currentCategory?.name
                      ? "text-burgundy"
                      : "text-muted-foreground"
                  )}
                  strokeWidth={1.5}
                />
                <span>
                  {currentCategory?.name ? `دسته‌بندی: ${currentCategory.name}` : "دسته‌بندی‌ها"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    activeMenu === "category" && "rotate-180 text-burgundy"
                  )}
                  strokeWidth={1.5}
                />
              </button>

              {/* Taxonomy Dropdown Menu */}
              {activeMenu === "category" && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] overflow-hidden rounded-xl border border-border/80 bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50"
                  dir="rtl"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2 px-2 text-xs font-semibold text-muted-foreground">
                    <span>درخت دسته‌بندی‌ها</span>
                    <Link
                      href="/category/محصولات"
                      onClick={closeMenu}
                      className="text-burgundy hover:underline"
                    >
                      همه محصولات
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                    {categoriesTree.map((node) => {
                      const isSelected =
                        currentCategory?.id === node.entityId ||
                        currentCategory?.url === toPath(node.entity?.url);
                      const hasChildren = (node.children?.length ?? 0) > 0;

                      return (
                        <div key={node.entityId || node.id} className="space-y-1">
                          <Link
                            href={toPath(node.entity?.url)}
                            onClick={closeMenu}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                              isSelected
                                ? "bg-burgundy/10 font-semibold text-burgundy"
                                : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              {isSelected && <Check className="h-3.5 w-3.5 text-burgundy" />}
                              <span>{node.entity?.name}</span>
                            </span>
                            {node.entity?.productsCount !== undefined && (
                              <span className="text-[11px] text-muted-foreground">
                                ({formatNumber(node.entity.productsCount)})
                              </span>
                            )}
                          </Link>

                          {/* Nested Subcategories (Taxonomy Children) */}
                          {hasChildren && (
                            <div className="mr-3 border-r-2 border-border/60 pr-2 space-y-1">
                              {node.children.map((child) => {
                                const isChildSelected =
                                  currentCategory?.id === child.entityId ||
                                  currentCategory?.url === toPath(child.entity?.url);

                                return (
                                  <Link
                                    key={child.entityId || child.id}
                                    href={toPath(child.entity?.url)}
                                    onClick={closeMenu}
                                    className={cn(
                                      "flex items-center justify-between rounded-lg px-2 py-1 text-[11px] transition-colors",
                                      isChildSelected
                                        ? "bg-burgundy/10 font-semibold text-burgundy"
                                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                    )}
                                  >
                                    <span className="flex items-center gap-1">
                                      {isChildSelected && (
                                        <Check className="h-3 w-3 text-burgundy" />
                                      )}
                                      <span>{child.entity?.name}</span>
                                    </span>
                                    {child.entity?.productsCount !== undefined && (
                                      <span className="text-[10px] text-muted-foreground/80">
                                        ({formatNumber(child.entity.productsCount)})
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Price Range Popover */}
          <div className={cn("relative shrink-0", activeMenu === "price" && "z-50")}>
            <button
              type="button"
              onClick={() => toggleMenu("price")}
              aria-expanded={activeMenu === "price"}
              className={cn(
                "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                activeMenu === "price" || isPriceActive
                  ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs"
                  : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
              )}
            >
              <span>محدوده قیمت</span>
              {isPriceActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
              )}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  activeMenu === "price" && "rotate-180 text-burgundy"
                )}
                strokeWidth={1.5}
              />
            </button>

            {/* Price Popover Menu */}
            {activeMenu === "price" && (
              <div
                className="absolute right-0 top-full mt-2 w-80 max-w-[92vw] overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50"
                dir="rtl"
              >
                <div className="mb-3 text-xs font-semibold text-foreground/90">
                  فیلتر بر اساس قیمت ({siteConfig.currencyLabel})
                </div>

                {/* Quick Presets */}
                <div className="mb-3 grid grid-cols-2 gap-1.5">
                  {PRICE_PRESETS.map((p) => {
                    const isPresetActive =
                      sp.get("min") === (p.min ?? null) && sp.get("max") === (p.max ?? null);

                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          push({ min: p.min, max: p.max });
                          closeMenu();
                        }}
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-center text-[11px] transition-colors",
                          isPresetActive
                            ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                            : "border-border/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Min / Max Inputs */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        inputMode="numeric"
                        placeholder="از قیمت"
                        aria-label="حداقل قیمت"
                        value={minInput}
                        onChange={(e) => setMinInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">تا</span>
                    <div className="relative flex-1">
                      <Input
                        inputMode="numeric"
                        placeholder="تا قیمت"
                        aria-label="حداکثر قیمت"
                        value={maxInput}
                        onChange={(e) => setMaxInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-8 flex-1 rounded-lg text-xs font-medium"
                      onClick={() => {
                        push({ min: minInput || undefined, max: maxInput || undefined });
                        closeMenu();
                      }}
                    >
                      اعمال قیمت
                    </Button>
                    {isPriceActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs text-muted-foreground hover:text-burgundy"
                        onClick={() => {
                          push({ min: undefined, max: undefined });
                          setMinInput("");
                          setMaxInput("");
                          closeMenu();
                        }}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Size Popover */}
          <div className={cn("relative shrink-0", activeMenu === "size" && "z-50")}>
            <button
              type="button"
              onClick={() => toggleMenu("size")}
              aria-expanded={activeMenu === "size"}
              className={cn(
                "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                activeMenu === "size" || Boolean(activeSize)
                  ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs"
                  : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
              )}
            >
              <span>{activeSize ? `سایز: ${activeSize}` : "سایز"}</span>
              {activeSize && (
                <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
              )}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  activeMenu === "size" && "rotate-180 text-burgundy"
                )}
                strokeWidth={1.5}
              />
            </button>

            {/* Size Popover Menu */}
            {activeMenu === "size" && (
              <div
                className="absolute right-0 top-full mt-2 w-64 max-w-[90vw] overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50"
                dir="rtl"
              >
                <div className="mb-2 text-xs font-semibold text-foreground/90">انتخاب سایز</div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SIZES.map((sz) => {
                    const isSelected = activeSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          push({ size: isSelected ? undefined : sz });
                          closeMenu();
                        }}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                          isSelected
                            ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                            : "border-border/70 hover:bg-muted/70 text-foreground/80"
                        )}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-border/60 pt-2 text-center">
                  <Link
                    href="/size-guide"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-1 text-[11px] text-burgundy hover:underline"
                  >
                    <span>راهنمای سایز با آدمک مونا</span>
                    <ChevronLeft className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3.5. Color (رنگ) Popover */}
          {(() => {
            const isColorActive =
              (colorFacet && (activeTaxonomy[colorFacet.attribute.id]?.length ?? 0) > 0) ||
              Boolean(activeColor);
            const selectedColorVals = colorFacet
              ? activeTaxonomy[colorFacet.attribute.id] || []
              : [];
            const colorLabel =
              selectedColorVals.length > 0 && colorFacet
                ? selectedColorVals.length === 1
                  ? `رنگ: ${colorFacet.values.find((v) => v.id === selectedColorVals[0])?.name ?? "انتخاب‌شده"}`
                  : `رنگ (${formatNumber(selectedColorVals.length)})`
                : activeColor
                ? `رنگ: ${activeColor}`
                : "رنگ";

            return (
              <div className={cn("relative shrink-0", activeMenu === "color" && "z-50")}>
                <button
                  type="button"
                  onClick={() => toggleMenu("color")}
                  aria-expanded={activeMenu === "color"}
                  className={cn(
                    "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                    activeMenu === "color" || isColorActive
                      ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs font-semibold"
                      : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <Palette
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      activeMenu === "color" || isColorActive
                        ? "text-burgundy"
                        : "text-muted-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                  <span>{colorLabel}</span>
                  {isColorActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      activeMenu === "color" && "rotate-180 text-burgundy"
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Color Popover Menu */}
                {activeMenu === "color" && (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
                    dir="rtl"
                  >
                    <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-foreground/90">
                      <span>انتخاب رنگ محصول</span>
                      {isColorActive && (
                        <button
                          type="button"
                          onClick={() => {
                            if (colorFacet) {
                              push({
                                [`taxonomy[${colorFacet.attribute.id}]`]: undefined,
                                color: undefined,
                              });
                            } else {
                              push({ color: undefined });
                            }
                            closeMenu();
                          }}
                          className="text-[11px] font-normal text-burgundy hover:underline"
                        >
                          حذف فیلتر رنگ
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {colorFacet
                        ? colorFacet.values.map((v) => {
                            const isSelected =
                              activeTaxonomy[colorFacet.attribute.id]?.includes(v.id) ||
                              activeColor === v.name;
                            const hex =
                              v.color ||
                              TAXONOMY_COLORS.find(
                                (c) => c.label === v.name || c.value === v.name
                              )?.hex ||
                              "#71717a";
                            const hasBorder = v.name === "سفید" || v.name === "کرم";
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  toggleTaxonomyValue(colorFacet.attribute.id, v.id);
                                  closeMenu();
                                }}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                                  isSelected
                                    ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                                    : "border-border/70 hover:bg-muted/70 text-foreground/80"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 rounded-full",
                                    hasBorder && "border border-border/80"
                                  )}
                                  style={{ backgroundColor: hex }}
                                />
                                <span className="truncate">{v.name}</span>
                                {isSelected && <Check className="mr-auto h-3 w-3 text-burgundy" />}
                              </button>
                            );
                          })
                        : TAXONOMY_COLORS.map((c) => {
                            const isSelected = activeColor === c.value || activeColor === c.label;
                            return (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => {
                                  push({ color: isSelected ? undefined : c.value });
                                  closeMenu();
                                }}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                                  isSelected
                                    ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                                    : "border-border/70 hover:bg-muted/70 text-foreground/80"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 rounded-full",
                                    c.border && "border border-border/80"
                                  )}
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="truncate">{c.label}</span>
                                {isSelected && <Check className="mr-auto h-3 w-3 text-burgundy" />}
                              </button>
                            );
                          })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3.6 Other Taxonomy Facets (e.g. طرح, جنسیت, مدل لباس خواب) */}
          {otherTaxonomyFacets.map((facet) => {
            const menuKey = `tax-${facet.attribute.id}`;
            const isOpen = activeMenu === menuKey;
            const selectedVals = activeTaxonomy[facet.attribute.id] || [];
            const isActive = selectedVals.length > 0;
            return (
              <div key={facet.attribute.id} className={cn("relative shrink-0", isOpen && "z-50")}>
                <button
                  type="button"
                  onClick={() => toggleMenu(menuKey)}
                  aria-expanded={isOpen}
                  className={cn(
                    "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                    isOpen || isActive
                      ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs font-semibold"
                      : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <span>
                    {isActive
                      ? `${facet.attribute.name} (${formatNumber(selectedVals.length)})`
                      : facet.attribute.name}
                  </span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden="true" />
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-burgundy"
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                {isOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 min-w-56 max-w-[90vw] overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
                    dir="rtl"
                  >
                    <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-foreground/90">
                      <span>{facet.attribute.name}</span>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            push({ [`taxonomy[${facet.attribute.id}]`]: undefined });
                            closeMenu();
                          }}
                          className="text-[11px] font-normal text-burgundy hover:underline"
                        >
                          پاک کردن
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {facet.values.map((v) => {
                        const isSelected = selectedVals.includes(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              toggleTaxonomyValue(facet.attribute.id, v.id);
                              closeMenu();
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                              isSelected
                                ? "bg-burgundy/10 font-semibold text-burgundy"
                                : "hover:bg-muted/70 text-foreground/80"
                            )}
                          >
                            <span>{v.name}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-burgundy shrink-0 mr-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Subtle Vertical Divider */}
          <div className="hidden h-5 w-[1px] bg-border/80 sm:block shrink-0" />

          {/* 4. Quick Facet Toggle: فقط کالاهای موجود (In-Stock) */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isInStock}
            onClick={() => push({ stock: isInStock ? undefined : "1" })}
            className={cn(
              "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
              isInStock
                ? "border-burgundy/40 bg-burgundy/8 text-burgundy font-semibold shadow-2xs"
                : "border-border/70 bg-card/80 text-foreground/80 hover:border-border hover:bg-muted/50"
            )}
          >
            {isInStock && <Check className="h-3.5 w-3.5 text-burgundy shrink-0" strokeWidth={1.5} />}
            <span>فقط موجودها</span>
          </button>

          {/* 5. Quick Facet Toggle: تخفیف‌دارها (Discounted) */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isDiscounted}
            onClick={() => push({ discounted: isDiscounted ? undefined : "1" })}
            className={cn(
              "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
              isDiscounted
                ? "border-burgundy/40 bg-burgundy/8 text-burgundy font-semibold shadow-2xs"
                : "border-border/70 bg-card/80 text-foreground/80 hover:border-border hover:bg-muted/50"
            )}
          >
            {isDiscounted && <Check className="h-3.5 w-3.5 text-burgundy shrink-0" strokeWidth={1.5} />}
            <span>تخفیف‌دارها</span>
          </button>

          {/* 6. More Filters Drawer Button (for advanced / all options) */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  activeFiltersCount > 0
                    ? "border-burgundy/40 bg-card text-burgundy"
                    : "border-border/80 bg-card text-foreground/80 hover:border-foreground/30 hover:bg-muted/60"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>فیلترهای بیشتر</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent side="start" title="فیلترها و مرتب‌سازی محصولات" className="flex flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6" dir="rtl">
                {/* Taxonomy in Drawer */}
                {categoriesTree.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <FolderTree className="h-4 w-4 text-burgundy" />
                      <span>دسته‌بندی‌ها</span>
                    </h3>
                    <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-border/70 p-2">
                      <Link
                        href="/category/محصولات"
                        className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        همه محصولات
                      </Link>
                      {categoriesTree.map((node) => {
                        const isSelected = currentCategory?.id === node.entityId;
                        return (
                          <div key={node.entityId || node.id} className="space-y-1">
                            <Link
                              href={toPath(node.entity?.url)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-2 py-1 text-xs",
                                isSelected
                                  ? "bg-burgundy/10 font-semibold text-burgundy"
                                  : "text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span>{node.entity?.name}</span>
                              {node.entity?.productsCount !== undefined && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({formatNumber(node.entity.productsCount)})
                                </span>
                              )}
                            </Link>
                            {node.children?.length > 0 && (
                              <div className="mr-3 border-r-2 border-border/60 pr-2 space-y-1">
                                {node.children.map((c) => (
                                  <Link
                                    key={c.entityId || c.id}
                                    href={toPath(c.entity?.url)}
                                    className={cn(
                                      "block rounded-md px-2 py-0.5 text-[11px]",
                                      currentCategory?.id === c.entityId
                                        ? "bg-burgundy/10 font-semibold text-burgundy"
                                        : "text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {c.entity?.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Checkboxes */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">وضعیت کالا</h3>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInStock}
                        onChange={(e) => push({ stock: e.target.checked ? "1" : undefined })}
                        className="h-4 w-4 rounded-sm accent-[hsl(var(--burgundy))]"
                      />
                      <span>فقط کالاهای موجود</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isDiscounted}
                        onChange={(e) => push({ discounted: e.target.checked ? "1" : undefined })}
                        className="h-4 w-4 rounded-sm accent-[hsl(var(--burgundy))]"
                      />
                      <span>فقط کالاهای تخفیف‌دار</span>
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    محدوده قیمت ({siteConfig.currencyLabel})
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input
                      inputMode="numeric"
                      placeholder="از"
                      aria-label="حداقل قیمت"
                      value={minInput}
                      onChange={(e) => setMinInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                      className="h-9 rounded-lg text-xs"
                    />
                    <span>–</span>
                    <Input
                      inputMode="numeric"
                      placeholder="تا"
                      aria-label="حداکثر قیمت"
                      value={maxInput}
                      onChange={(e) => setMaxInput(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                      className="h-9 rounded-lg text-xs"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full rounded-lg text-xs"
                    onClick={() =>
                      push({ min: minInput || undefined, max: maxInput || undefined })
                    }
                  >
                    اعمال محدوده قیمت
                  </Button>
                </div>

                {/* Color options */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-burgundy" />
                      <span>{colorFacet?.attribute.name ?? "رنگ"}</span>
                    </span>
                    {colorFacet && (activeTaxonomy[colorFacet.attribute.id]?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          push({
                            [`taxonomy[${colorFacet.attribute.id}]`]: undefined,
                            color: undefined,
                          })
                        }
                        className="text-[11px] font-normal text-burgundy hover:underline"
                      >
                        حذف فیلتر رنگ
                      </button>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {colorFacet
                      ? colorFacet.values.map((v) => {
                          const isSelected =
                            activeTaxonomy[colorFacet.attribute.id]?.includes(v.id) ||
                            activeColor === v.name;
                          const hex =
                            v.color ||
                            TAXONOMY_COLORS.find(
                              (c) => c.label === v.name || c.value === v.name
                            )?.hex ||
                            "#71717a";
                          const hasBorder = v.name === "سفید" || v.name === "کرم";
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleTaxonomyValue(colorFacet.attribute.id, v.id)}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-colors",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 text-burgundy font-semibold"
                                  : "border-border/70 hover:bg-muted text-foreground/80"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 rounded-full",
                                  hasBorder && "border border-border/80"
                                )}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="truncate">{v.name}</span>
                              {isSelected && <Check className="mr-auto h-3 w-3 text-burgundy" />}
                            </button>
                          );
                        })
                      : TAXONOMY_COLORS.map((c) => {
                          const isSelected = activeColor === c.value || activeColor === c.label;
                          return (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => push({ color: isSelected ? undefined : c.value })}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-colors",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 text-burgundy font-semibold"
                                  : "border-border/70 hover:bg-muted text-foreground/80"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 rounded-full",
                                  c.border && "border border-border/80"
                                )}
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="truncate">{c.label}</span>
                              {isSelected && <Check className="mr-auto h-3 w-3 text-burgundy" />}
                            </button>
                          );
                        })}
                  </div>
                </div>

                {/* Other Taxonomy Facets in More Filters Drawer */}
                {otherTaxonomyFacets.map((facet) => {
                  const selectedVals = activeTaxonomy[facet.attribute.id] || [];
                  return (
                    <div key={facet.attribute.id}>
                      <h3 className="mb-2 text-sm font-semibold flex items-center justify-between text-foreground">
                        <span>{facet.attribute.name}</span>
                        {selectedVals.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              push({ [`taxonomy[${facet.attribute.id}]`]: undefined })
                            }
                            className="text-[11px] font-normal text-burgundy hover:underline"
                          >
                            حذف ({formatNumber(selectedVals.length)})
                          </button>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {facet.values.map((v) => {
                          const isSelected = selectedVals.includes(v.id);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleTaxonomyValue(facet.attribute.id, v.id)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                                isSelected
                                  ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                                  : "border-border/70 bg-card text-foreground/80 hover:bg-muted"
                              )}
                            >
                              <span>{v.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-burgundy" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Size options */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">سایز</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SIZES.map((sz) => {
                      const isSelected = activeSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => push({ size: isSelected ? undefined : sz })}
                          className={cn(
                            "rounded-lg border px-3 py-1 text-xs transition-colors",
                            isSelected
                              ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                              : "border-border/70 hover:bg-muted"
                          )}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort in Drawer */}
                {showSort && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">مرتب‌سازی بر اساس</h3>
                    <div className="space-y-1.5">
                      {SORT_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors",
                            activeSort === opt.value
                              ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                              : "border-border/60 hover:bg-muted"
                          )}
                        >
                          <span>{opt.label}</span>
                          <input
                            type="radio"
                            name="drawer-sort"
                            value={opt.value}
                            checked={activeSort === opt.value}
                            onChange={() =>
                              push({ sort: opt.value === "newest" ? undefined : opt.value })
                            }
                            className="accent-[hsl(var(--burgundy))]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="border-t border-border/80 p-4 flex items-center justify-between gap-3 bg-card">
                <SheetClose asChild>
                  <Button className="flex-1 rounded-lg text-xs font-medium">
                    مشاهده نتایج
                    {total !== undefined && ` (${formatNumber(total)} محصول)`}
                  </Button>
                </SheetClose>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="rounded-lg text-xs text-muted-foreground hover:text-burgundy"
                  >
                    پاک کردن همه
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right Side: Sort dropdown */}
        {showSort && (
          <div className={cn("relative shrink-0", activeMenu === "sort" && "z-50")}>
            <button
              type="button"
              onClick={() => toggleMenu("sort")}
              aria-expanded={activeMenu === "sort"}
              className={cn(
                "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150 active:scale-[0.99]",
                activeMenu === "sort"
                  ? "border-burgundy/40 bg-burgundy/8 text-burgundy shadow-2xs"
                  : "border-border/70 bg-card/80 text-foreground/85 hover:border-border hover:bg-muted/60"
              )}
            >
              <span className="hidden sm:inline text-muted-foreground">مرتب‌سازی:</span>
              <span className="font-semibold text-foreground">{activeSortLabel}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  activeMenu === "sort" && "rotate-180 text-burgundy"
                )}
                strokeWidth={1.5}
              />
            </button>

            {/* Sort Popover Menu */}
            {activeMenu === "sort" && (
              <div
                className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-border/80 bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50"
                dir="rtl"
              >
                {SORT_OPTIONS.map((o) => {
                  const isSelected = activeSort === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        push({ sort: o.value === "newest" ? undefined : o.value });
                        closeMenu();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        isSelected
                          ? "bg-burgundy/10 font-semibold text-burgundy"
                          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <span>{o.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-burgundy" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Row & Chips (shown when filters are applied) */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-0.5">
          {total !== undefined && (
            <p className="text-xs font-medium text-muted-foreground">
              {formatNumber(total)} محصول با فیلترهای انتخابی
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mr-auto">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.onRemove}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1 text-xs font-medium text-foreground/85 transition-colors duration-150 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy active:scale-[0.98]"
              >
                <span>{c.label}</span>
                <X className="h-3 w-3 text-muted-foreground group-hover:text-burgundy" strokeWidth={1.5} />
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-burgundy"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
              <span>پاک کردن فیلترها</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
