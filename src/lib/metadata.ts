import type { Metadata } from "next";
import type { Product, ProductCategory, CmsPage, BlogPage } from "@sazito/client-sdk";
import { siteConfig } from "@/config/site";
import { formatPrice, toFaDigits, toPath } from "./utils";
import { summarize, splitAttributes, optionGroups } from "./product";

export function stripHtml(html?: string, maxLength = 160): string {
  if (!html) return "";
  const cleaned = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return maxLength && cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}

export function getCategoryBanner(nameOrId?: string | number): string {
  const norm = String(nameOrId ?? "").trim().toLowerCase();
  if (norm === "1" || norm.includes("بادی") || norm.includes("body")) {
    return "/images/brand/v2/mona-category-1-studio-1200.webp";
  }
  if (norm === "8" || norm.includes("لباس خواب") || norm.includes("خواب") || norm.includes("sleep")) {
    return "/images/brand/v2/mona-category-2-studio-1200.webp";
  }
  if (norm === "11" || norm.includes("تاپ") || norm.includes("شلوار") || norm.includes("ست")) {
    return "/images/brand/v2/mona-category-3-studio-1200.webp";
  }
  if (norm === "16" || norm.includes("فانتزی") || norm.includes("کاستوم") || norm.includes("fantasy")) {
    return "/images/brand/v2/mona-category-4-studio-1200.webp";
  }
  return "/images/brand/v2/mona-hero-studio-1440.webp";
}

export interface SocialImageObject {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface SocialMetadataOptions {
  title: string;
  description: string;
  path?: string;
  images?: Array<string | SocialImageObject>;
  type?: "website" | "article";
  noIndex?: boolean;
  extraMeta?: Record<string, string | number>;
}

export const DEFAULT_OG_IMAGE: SocialImageObject = {
  url: "/images/brand/v2/mona-hero-studio-1440.webp",
  width: 1440,
  height: 1080,
  alt: `${siteConfig.name} - ${siteConfig.tagline}`,
  type: "image/webp",
};

export function buildMetadata({
  title,
  description,
  path = "/",
  images,
  type = "website",
  noIndex = false,
  extraMeta,
}: SocialMetadataOptions): Metadata {
  const resolvedImages = images?.length
    ? images.map((img) => (typeof img === "string" ? { url: img } : img))
    : [DEFAULT_OG_IMAGE];

  const primaryImage = typeof resolvedImages[0] === "string" ? resolvedImages[0] : resolvedImages[0].url;

  return {
    title,
    description,
    alternates: path ? { canonical: toPath(path) } : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: toPath(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
    other: extraMeta,
  };
}

export function buildProductMetadata(product: Product, path: string): Metadata {
  const summary = summarize(product);
  const { description: rawDesc } = splitAttributes(product.attributes);
  const cleanDesc = stripHtml(rawDesc, 140);

  const parts: string[] = [];
  if (summary.price) {
    if (summary.discount > 0) {
      parts.push(`تخفیف ویژه: ${formatPrice(summary.price)} (${toFaDigits(summary.discount)}٪ تخفیف)`);
    } else {
      parts.push(`قیمت: ${formatPrice(summary.price)}`);
    }
  }

  const groups = optionGroups(product.variants ?? []);
  const sizeGroup = groups.find((g) => g.name.includes("سایز") || g.name.toLowerCase().includes("size"));
  if (sizeGroup && sizeGroup.values.length > 0) {
    const sizeList = sizeGroup.values.map((v) => v.value).join("، ");
    parts.push(`سایزها: ${sizeList}`);
  }

  parts.push(summary.available ? "موجود در انبار" : "ناموجود");

  const metaDesc = cleanDesc
    ? `${parts.join(" | ")} — ${cleanDesc}`
    : `${parts.join(" | ")} — خرید آنلاین ${product.name} با تضمین کیفیت و ارسال سریع از فروشگاه پوشاک مونا.`;

  const images = (product.images ?? []).length > 0
    ? (product.images ?? []).slice(0, 4).map((img) => ({
        url: img.url,
        width: img.width || 1024,
        height: img.height || 1024,
        alt: img.alt || product.name,
      }))
    : [DEFAULT_OG_IMAGE];

  const extraMeta: Record<string, string | number> = {
    "product:availability": summary.available ? "in stock" : "out of stock",
  };
  if (summary.price) {
    extraMeta["product:price:amount"] = Math.round(summary.price / siteConfig.priceDivisor);
    extraMeta["product:price:currency"] = siteConfig.currencyLabel;
  }

  return buildMetadata({
    title: `${product.name} | ${siteConfig.name}`,
    description: metaDesc,
    path,
    images,
    type: "website",
    extraMeta,
  });
}

export function buildCategoryMetadata(category: ProductCategory, path: string, filtered = false): Metadata {
  const cleanDesc = stripHtml(category.description, 150);
  const desc = cleanDesc || `مجموعه جدیدترین مدل‌های ${category.name} در پوشاک مونا؛ تصاویر، تنوع سایز و خرید اینترنتی با ارسال سریع.`;
  const banner = getCategoryBanner(category.name || category.id);

  return buildMetadata({
    title: `خرید و قیمت مدل‌های ${category.name} | ${siteConfig.name}`,
    description: desc,
    path,
    images: [{ url: banner, width: 1200, height: 800, alt: category.name, type: "image/webp" }],
    noIndex: filtered,
  });
}

export function buildCmsMetadata(page: CmsPage | BlogPage, path: string, isBlog = false): Metadata {
  const cleanSummary = page.summary?.trim() || stripHtml(page.content, 150);
  const desc = cleanSummary || `${page.name} در فروشگاه اینترنتی پوشاک مونا.`;
  const banner = page.image?.url || DEFAULT_OG_IMAGE.url;

  return buildMetadata({
    title: isBlog ? `${page.name} | مجله پوشاک مونا` : `${page.name} | ${siteConfig.name}`,
    description: desc,
    path,
    images: [{ url: banner, width: 1200, height: 630, alt: page.name }],
    type: isBlog ? "article" : "website",
  });
}
