import type { MetadataRoute } from "next";
import { getCategories, getCmsPages, listProducts } from "@/lib/sazito/services";
import { siteConfig } from "@/config/site";
import { toPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Built only from real Sazito data (products, categories, CMS pages). Empty if Sazito is not configured. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: "daily", priority: 1 }, { url: `${base}/search`, changeFrequency: "daily", priority: 0.6 }];
  const [cats, cms] = await Promise.all([getCategories(), getCmsPages()]);
  for (const c of cats.data?.categories ?? []) if (c.url) entries.push({ url: base + toPath(c.url), changeFrequency: "weekly", priority: 0.8 });
  for (const p of cms.data?.items ?? []) if (p.url && p.enabled !== false) entries.push({ url: base + toPath(p.url), changeFrequency: "monthly", priority: 0.4 });
  for (let page = 1; page <= 20; page++) {
    const r = await listProducts({ page, pageSize: 100, sort: "newest" }, 600);
    if (!r.data) break;
    for (const p of r.data.items) entries.push({ url: base + toPath(p.url), changeFrequency: "weekly", priority: 0.7 });
    if (page * 100 >= r.data.total) break;
  }
  entries.push({ url: `${base}/size-guide`, changeFrequency: "monthly", priority: 0.5 });
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
