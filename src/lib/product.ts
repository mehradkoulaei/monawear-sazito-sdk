import type { ProductAttribute, ProductListItem, ProductListVariant, Product, ProductVariant } from "@sazito/client-sdk";
import { discountPercent } from "./utils";

type AnyProduct = ProductListItem | Product;
type AnyVariant = ProductListVariant | ProductVariant;

export function attrValue(a: ProductAttribute): string {
  return typeof a.value === "string" ? a.value : a.value?.value ?? "";
}
export function attrColor(a: ProductAttribute): string | undefined {
  return typeof a.value === "object" && a.value?.fieldType === "color" ? a.value.extra : undefined;
}

export function variantAvailable(v: AnyVariant): boolean {
  return v.enabled && (!v.isStockManaged || v.stockQuantity > 0);
}

export function differentiators(v: AnyVariant): ProductAttribute[] {
  const d = (v.attributes ?? []).filter(
    (a) => a.attributeType === "differentiator" || (!a.attributeType && a.name && attrValue(a))
  );
  return d.length ? d : [];
}

export interface ProductSummary {
  price?: number;
  originalPrice?: number;
  discount: number;
  available: boolean;
  colors: Array<{ label: string; hex: string }>;
  variantCount: number;
  singleVariantId?: number;
}

/** Derives card data ONLY from real variant data returned by Sazito. */
export function summarize(p: AnyProduct): ProductSummary {
  const variants = (p.variants ?? []).filter((v) => v.enabled);
  const avail = variants.filter(variantAvailable);
  const pool = avail.length ? avail : variants;
  const cheapest = [...pool].sort((a, b) => a.price - b.price)[0];
  const colorMap = new Map<string, string>();
  for (const v of variants) {
    for (const a of v.attributes ?? []) {
      const hex = attrColor(a);
      if (hex) colorMap.set(attrValue(a), hex);
    }
  }
  return {
    price: cheapest?.price,
    originalPrice: cheapest?.originalPrice,
    discount: discountPercent(cheapest?.price, cheapest?.originalPrice),
    available: avail.length > 0,
    colors: [...colorMap.entries()].map(([label, hex]) => ({ label, hex })),
    variantCount: variants.length,
    singleVariantId: variants.length === 1 && avail.length === 1 ? avail[0].id : undefined,
  };
}

export interface OptionGroup {
  name: string;
  values: Array<{ value: string; hex?: string }>;
}

/** Groups variant-differentiating attributes (e.g. size, color) into selectable option groups. */
export function optionGroups(variants: AnyVariant[]): OptionGroup[] {
  const groups = new Map<string, Map<string, string | undefined>>();
  for (const v of variants.filter((x) => x.enabled)) {
    for (const a of differentiators(v)) {
      const g = groups.get(a.name) ?? new Map<string, string | undefined>();
      g.set(attrValue(a), attrColor(a));
      groups.set(a.name, g);
    }
  }
  return [...groups.entries()].map(([name, vals]) => ({
    name,
    values: [...vals.entries()].map(([value, hex]) => ({ value, hex })),
  }));
}

export function variantMatches(v: AnyVariant, selection: Record<string, string>): boolean {
  const attrs = differentiators(v);
  return Object.entries(selection).every(([name, value]) => attrs.some((a) => a.name === name && attrValue(a) === value));
}

export function variantLabel(v: AnyVariant): string {
  const d = differentiators(v);
  if (d.length) return d.map(attrValue).join(" / ");
  const any = (v.attributes ?? []).map(attrValue).filter(Boolean);
  return any.length ? any.join(" / ") : `گزینه ${v.id}`;
}

const DESCRIPTION_NAMES = /^(description|توضیحات|توضیح|full_description)/i;
export function splitAttributes(attrs: ProductAttribute[] | undefined) {
  const list = attrs ?? [];
  const description = list.find((a) => DESCRIPTION_NAMES.test(a.name.trim()));
  const specs = list.filter((a) => a !== description && a.attributeType !== "differentiator" && attrValue(a));
  return { description: description ? attrValue(description) : "", specs };
}
