import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/products/product-grid";
import { jsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { HeroSlider } from "@/components/home/hero-slider";
import { StoryRail } from "@/components/help/story-rail";
import { CategoryTiles, Faq, Mosaic, ShopTheLook, TrustStrip } from "@/components/home/sections";
import { ProductRail } from "@/components/products/product-rail";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { getCategories, listProducts } from "@/lib/sazito/services";
import { siteConfig } from "@/config/site";

export const revalidate = 120;
export const metadata: Metadata = { title: { absolute: `${siteConfig.name} | ${siteConfig.tagline}` }, description: siteConfig.description, openGraph: { title: siteConfig.name, description: siteConfig.description, url: "/", images: ["/images/brand/v2/mona-hero-studio-1440.webp"] }, alternates: { canonical: "/" } };

async function HomeCollections() {
  const [cats, fresh, best, disc] = await Promise.all([
    getCategories(),
    listProducts({ sort: "newest", pageSize: 10 }),
    listProducts({ sort: "best-selling", pageSize: 10 }),
    listProducts({ discountedOnly: true, pageSize: 10 }),
  ]);

  return (
    <>
      {fresh.error && <div className="container py-5" role="status"><p className="border border-burgundy/10 bg-secondary/50 p-4 text-center text-sm leading-7 text-muted-foreground">دریافت محصولات در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.</p></div>}
      <CategoryTiles nodes={cats.data?.tree?.treeStructure?.nodes ?? []} />
      <ProductRail eyebrow="تازه‌ها" title="جدیدترین محصولات" href="/search?sort=newest" products={fresh.data?.items ?? []} />
      <ProductRail eyebrow="محبوب" title="پرفروش‌ها" href="/search?sort=best-selling" products={best.data?.items ?? []} />
      <Mosaic />
      <ProductRail eyebrow="فرصت ویژه" title="محصولات تخفیف‌دار" href="/search?discounted=1" products={disc.data?.items ?? []} />
      <ShopTheLook />

    </>
  );
}

/** Stream the catalog independently so a slow commerce API cannot delay the hero. */
export default function HomePage() {
  return <><StoryRail /><HeroSlider /><TrustStrip /><Suspense fallback={<div className="container section-space" aria-label="در حال دریافت محصولات"><ProductGridSkeleton count={4} /></div>}><HomeCollections /></Suspense><Faq /><RecentlyViewed />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([
        { "@context": "https://schema.org", "@type": "Organization", "@id": `${siteConfig.url}/#organization`, name: siteConfig.name, alternateName: siteConfig.nameEn, url: siteConfig.url, logo: `${siteConfig.url}/images/brand/mona-logo.png` },
        { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, inLanguage: "fa-IR" },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: siteConfig.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]) }} /></>;
}
