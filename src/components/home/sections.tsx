import Link from "next/link";
import { BannerImage } from "./banner-image";
import { ArrowLeft, Headset, Ruler, ShieldCheck, Truck } from "lucide-react";
import type { CategoryTreeNode } from "@sazito/client-sdk";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductRail } from "@/components/products/product-rail";
import { listProducts } from "@/lib/sazito/services";
import { siteConfig } from "@/config/site";
import { toPath } from "@/lib/utils";

/** Real menu routes when available; editorial collection links remain usable during an API outage. */
function categoryHref(nodes: CategoryTreeNode[], id: number, name: string): string | undefined {
  for (const node of nodes) {
    if ((node.entityId === id || node.entity?.name === name) && node.entity?.url) return toPath(node.entity.url);
    const nested = categoryHref(node.children ?? [], id, name);
    if (nested) return nested;
  }
}

/** Original v2 collection artwork, titles and descriptions; not a replacement product catalog. */
export function CategoryTiles({ nodes }: { nodes: CategoryTreeNode[] }) {
  return (
    <section className="container section-space original-collections" aria-label="مجموعه‌های مونا">
      <div className="section-heading">
        <div>
          <p className="editorial-kicker" dir="ltr">THE MONA COLLECTION</p>
          <h2 className="text-wrap-balance">مجموعه‌های مونا</h2>
          <p className="section-description text-wrap-pretty">انتخاب مدل بر اساس استایل و راحتی؛ از بادی‌های فرم‌دهنده تا ست‌های خواب ساتن.</p>
        </div>
        <Link
          href="/search"
          className="section-link hidden sm:inline-flex items-center gap-1.5 group/link"
        >
          <span>مشاهدهٔ همهٔ دسته‌بندی‌ها</span>
          <ArrowLeft size={15} strokeWidth={1.5} className="transition-transform duration-200 group-hover/link:-translate-x-1" />
        </Link>
      </div>
      <div className="category-grid">
        {siteConfig.collections.map((collection) => {
          const href = categoryHref(nodes, collection.categoryId, collection.name) ?? `/search?q=${encodeURIComponent(collection.name)}`;
          return (
            <Link
              key={collection.categoryId}
              href={href}
              className="category-tile group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="category-art">
                <BannerImage
                  src={collection.image}
                  alt={`تصویر تبلیغاتی مجموعهٔ ${collection.name} پوشاک مونا`}
                  sizes="(max-width: 767px) 50vw, 25vw"
                />
              </div>
              <div className="category-label">
                <div className="category-label-text">
                  <h3 className="truncate">{collection.name}</h3>
                  <p className="line-clamp-1">{collection.text}</p>
                </div>
                <span className="collection-arrow" aria-hidden="true">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Editorial sleepwear section with responsive campaign artwork. */
export function Mosaic() {
  const edit = siteConfig.softEdit;
  return (
    <section className="container section-space" aria-label="THE SOFT EDIT">
      <div className="soft-edit">
        <div className="soft-edit-photo"><BannerImage src={edit.image} alt={edit.alt} sizes="(max-width: 767px) 100vw, 48vw" /><span dir="ltr">THE SOFT EDIT</span></div>
        <div className="soft-edit-copy"><p className="editorial-kicker" dir="ltr">{edit.eyebrow}</p><h2 className="whitespace-pre-line">{edit.title}</h2><p className="whitespace-pre-line">{edit.text}</p><Link href={edit.href} className="editorial-button">{edit.cta}<ArrowLeft size={17} /></Link><span className="soft-signature" dir="ltr">{edit.signature}</span></div>
      </div>
    </section>
  );
}

/** Shop the Look: only renders when real product IDs are configured. */
export async function ShopTheLook() {
  const ids = siteConfig.shopTheLook.productIds as readonly number[];
  if (!ids.length) return null;
  const r = await listProducts({ pinnedIds: [...ids], pageSize: ids.length });
  if (!r.data?.items.length) return null;
  return <ProductRail title={siteConfig.shopTheLook.title} eyebrow="Shop the Look" products={r.data.items} />;
}

const ICONS = { shield: ShieldCheck, truck: Truck, ruler: Ruler, headset: Headset } as const;
export function TrustStrip() {
  return (
    <section className="trust-strip border-y bg-secondary/40" aria-label="خدمات">
      <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {siteConfig.trust.map((t) => {
          const Icon = ICONS[t.icon as keyof typeof ICONS];
          return (
            <div key={t.title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-burgundy" strokeWidth={1.25} />
              <div><p className="text-sm font-semibold">{t.title}</p><p className="mt-0.5 text-xs leading-6 text-muted-foreground">{t.text}</p></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="container section-space faq-section" aria-label="سؤالات متداول"><div><p className="editorial-kicker" dir="ltr">HERE TO HELP</p><h2 className="mb-4 text-2xl font-bold">قبل از انتخاب، بیشتر بدانید</h2><p className="mb-5 text-sm leading-8 text-muted-foreground">پاسخ چند سؤال درباره انتخاب سایز و پیگیری خرید.</p><Link href="/order-tracking" className="section-link">پیگیری سفارش <ArrowLeft size={16} /></Link></div><div>
      
      <Accordion type="single" collapsible>
        {siteConfig.faq.map((f, i) => (
          <AccordionItem key={i} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>
        ))}
      </Accordion></div>
    </section>
  );
}
