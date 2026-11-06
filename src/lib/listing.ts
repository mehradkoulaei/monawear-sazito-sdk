import type { ProductFilters, ProductListItem, ProductSort } from "@sazito/client-sdk";
import { siteConfig } from "@/config/site";

export type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "جدیدترین" },
  { value: "best-selling", label: "پرفروش‌ترین" },
  { value: "!price", label: "ارزان‌ترین" },
  { value: "price", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
  { value: "availability", label: "موجودها اول" },
];
const SORTS = new Set(SORT_OPTIONS.map((s) => s.value));
export const PAGE_SIZE = 24;

export interface ListingState {
  page: number;
  sort?: ProductSort;
  /** price bounds in DISPLAY units (what the shopper types) */
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  discounted: boolean;
  size?: string;
  color?: string;
  pattern?: string;
  /** Sazito upstream taxonomy filter: attribute ID -> value ID(s) */
  taxonomy?: Record<string, string | string[]>;
}

export function parseListing(sp: SP): ListingState {
  const num = (k: string) => {
    const raw = first(sp[k]);
    if (!raw) return undefined;
    const clean = toEnglishDigits(String(raw)).replace(/\D/g, "");
    const n = Number(clean);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const sort = first(sp.sort) as ProductSort | undefined;

  // Parse taxonomy filter (JSON object string or bracket syntax: taxonomy[attr_id]=val_id)
  let taxonomy: Record<string, string | string[]> | undefined;
  const rawTax = first(sp.taxonomy);
  if (rawTax && typeof rawTax === "string") {
    try {
      const parsed = JSON.parse(rawTax);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        taxonomy = parsed as Record<string, string | string[]>;
      }
    } catch {}
  }

  for (const [k, v] of Object.entries(sp)) {
    const match = k.match(/^taxonomy\[([^\]]+)\]$/);
    if (match) {
      const attrId = match[1];
      const val = first(v);
      if (val) {
        if (!taxonomy) taxonomy = {};
        taxonomy[attrId] = val.includes(",") ? val.split(",") : val;
      }
    }
  }

  return {
    page: Math.max(1, Math.floor(num("page") ?? 1)),
    sort: sort && SORTS.has(sort) ? sort : undefined,
    priceMin: num("min"),
    priceMax: num("max"),
    inStock: first(sp.stock) === "1",
    discounted: first(sp.discounted) === "1",
    size: first(sp.size) || undefined,
    color: first(sp.color) || undefined,
    pattern: first(sp.pattern) || undefined,
    taxonomy,
  };
}

export function hasNativeTaxonomyFilter(s: ListingState): boolean {
  return Boolean(s.taxonomy && Object.keys(s.taxonomy).length > 0);
}

export function hasTaxonomyFilter(s: ListingState): boolean {
  return hasNativeTaxonomyFilter(s) || Boolean(s.size || s.color || s.pattern);
}

/**
 * Maps UI state to SDK filters.
 * NOTE: SDK v1.3.3 adds the `in_stock` filter only when `availableOnly === false` (verified in source).
 * Also, Sazito backend requires both min_price and max_price together when filtering prices;
 * omitting max_price causes Sazito to default max_price to 0, returning 0 products.
 */
export function toFilters(
  s: ListingState,
  categoryId?: number,
  pageSize: number = PAGE_SIZE,
  page: number = s.page
): ProductFilters {
  const d = siteConfig.priceDivisor;
  let min: number | undefined;
  let max: number | undefined;

  if (s.priceMin !== undefined && s.priceMax !== undefined) {
    min = s.priceMin * d;
    max = s.priceMax * d;
  } else if (s.priceMin !== undefined) {
    min = s.priceMin * d;
    max = 100_000_000 * d; // Safe upper bound for Tomans
  } else if (s.priceMax !== undefined) {
    min = 0;
    max = s.priceMax * d;
  }

  return {
    page,
    pageSize,
    sort: s.sort ?? "newest",
    categories: categoryId,
    priceMin: min,
    priceMax: max,
    availableOnly: s.inStock ? false : undefined,
    discountedOnly: s.discounted ? true : undefined,
    taxonomy: s.taxonomy && Object.keys(s.taxonomy).length > 0 ? s.taxonomy : undefined,
  };
}

function normalizeSize(v?: string): string {
  const s = (v || "").trim().toLowerCase();
  if (s === "free" || s === "freesize" || s === "فری سایز" || s === "فری") return "free";
  if (s === "plus" || s === "پلاس" || s === "پلاس سایز" || s === "سایز بزرگ" || s === "بزرگ") return "plus";
  if (s === "s" || s === "small") return "s";
  if (s === "m" || s === "med" || s === "medium") return "m";
  if (s === "l" || s === "large") return "l";
  if (s === "xl" || s === "xlarge") return "xl";
  if (s === "2xl" || s === "xxl") return "2xl";
  if (s === "3xl" || s === "xxxl") return "3xl";
  return s;
}

/** In-memory size attribute filter across product variants and product title */
export function filterBySize<T extends ProductListItem>(items: T[], size?: string): T[] {
  if (!size) return items;
  const norm = normalizeSize(size);
  return items.filter((item) => {
    const nameLower = item.name.toLowerCase();
    const inName =
      (norm === "plus" && (nameLower.includes("پلاس") || nameLower.includes("سایز بزرگ") || nameLower.includes("plus"))) ||
      (norm === "free" && (nameLower.includes("فری") || nameLower.includes("free")));
    const inVariant = item.variants?.some((v) =>
      v.attributes?.some((a) => {
        if (!a || typeof a.value !== "string") return false;
        const valNorm = normalizeSize(a.value);
        return valNorm === norm || a.value.toLowerCase().includes(norm);
      })
    );
    return inName || inVariant;
  });
}

export const COLOR_SYNONYMS: Record<string, string[]> = {
  "طوسی": ["طوسی", "خاکستری", "نوک مدادی", "سیلور", "نقره‌ای", "grey", "gray"],
  "خاکستری": ["طوسی", "خاکستری", "نوک مدادی", "سیلور", "نقره‌ای", "grey", "gray"],
  "مشکی": ["مشکی", "سیاه", "black"],
  "سفید": ["سفید", "white"],
  "قرمز": ["قرمز", "سرخ", "red"],
  "زرشکی": ["زرشکی", "بورگاندی", "burgundy", "maroon"],
  "صورتی": ["صورتی", "pink"],
  "سرخابی": ["سرخابی", "magenta", "fuchsia"],
  "آبی": ["آبی", "blue", "سرمه‌ای"],
  "سبز": ["سبز", "green", "یشمی"],
  "کرم": ["کرم", "کرمی", "بژ", "نود", "cream", "beige"],
  "پلنگی": ["پلنگی", "leopard"],
  "گلبهی": ["گلبهی", "هلویی", "peach", "coral"],
  "بنفش": ["بنفش", "purple", "یاسی"],
};

/** In-memory color filter matching product name and variant attributes with synonym support */
export function filterByColor<T extends ProductListItem>(items: T[], color?: string): T[] {
  if (!color) return items;
  const c = color.trim().toLowerCase();
  const synonyms = COLOR_SYNONYMS[c] || [c];
  return items.filter((item) => {
    const nameLower = item.name.toLowerCase();
    const inName = synonyms.some((s) => nameLower.includes(s));
    const inVariant = item.variants?.some((v) =>
      v.attributes?.some((a) => {
        if (!a || typeof a.value !== "string") return false;
        const valLower = a.value.toLowerCase();
        return synonyms.some((s) => valLower.includes(s));
      })
    );
    return inName || inVariant;
  });
}

/** In-memory pattern filter matching product name and attributes */
export function filterByPattern<T extends ProductListItem>(items: T[], pattern?: string): T[] {
  if (!pattern) return items;
  const p = pattern.trim().toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(p));
}

/** Full taxonomy filter helper combining size, color, and pattern */
export function filterByTaxonomy<T extends ProductListItem>(
  items: T[],
  filters: { size?: string; color?: string; pattern?: string }
): T[] {
  let result = items;
  if (filters.size) result = filterBySize(result, filters.size);
  if (filters.color) result = filterByColor(result, filters.color);
  if (filters.pattern) result = filterByPattern(result, filters.pattern);
  return result;
}

export function buildQuery(sp: SP, patch: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = first(v);
    if (val !== undefined && val !== "") q.set(k, val);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "") q.delete(k);
    else q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
