import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const faDigits = "۰۱۲۳۴۵۶۷۸۹";
export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => faDigits[Number(d)]);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/** Formats a price using siteConfig.priceDivisor (verify the backend unit first!). */
export function formatPrice(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return `${formatNumber(Math.round(value / siteConfig.priceDivisor))} ${siteConfig.currencyLabel}`;
}

export function discountPercent(price?: number, original?: number): number {
  if (!price || !original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

/** Sazito entity URLs may be relative paths or absolute URLs; return an in-site path. */
export function toPath(url: string | undefined | null): string {
  if (!url) return "#";
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      return u.pathname + u.search;
    }
  } catch {
    /* ignore */
  }
  return url.startsWith("/") ? url : `/${url}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
