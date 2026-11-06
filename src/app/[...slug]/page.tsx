import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CategoryPage } from "@/components/products/category-page";
import { ProductPage } from "@/components/products/product-page";
import { CmsPageView } from "@/components/cms-page";
import { ErrorState } from "@/components/state";
import { resolveRoute } from "@/lib/sazito/services";
import { splitAttributes } from "@/lib/product";
import type { SP } from "@/lib/listing";
import { toPath } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<SP> };

function toRequestPath(slug: string[]): string {
  return "/" + slug.map((s) => { try { return decodeURIComponent(s); } catch { return s; } }).join("/");
}

const strip = (html?: string) => (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : undefined);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const path = toRequestPath((await params).slug);
  if (path === "/products" || path.startsWith("/products/")) {
    return { title: "همه محصولات" };
  }
  const r = await resolveRoute(path);
  const route = r.data;
  if (!route || route.entityType === "unknown") return { title: "صفحه پیدا نشد", robots: { index: false } };
  const canonical = toPath(route.url || path);
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  switch (route.entityType) {
    case "product": {
      const e = route.entity;
      return { title: e.name, description: strip(splitAttributes(e.attributes).description) || `تصاویر، قیمت و گزینه‌های موجود ${e.name} را در پوشاک مونا ببینید.`, alternates: { canonical }, openGraph: { title: e.name, url: canonical, description: strip(splitAttributes(e.attributes).description), type: "website", images: e.images?.[0]?.url ? [e.images[0].url] : undefined } };
    }
    case "product_category":
      return { title: route.entity.name, description: strip(route.entity.description) || `مدل‌های ${route.entity.name} در پوشاک مونا؛ تصاویر، قیمت و گزینه‌های سایز را مقایسه کنید.`, alternates: { canonical }, robots: filtered ? { index: false, follow: true } : undefined, openGraph: { title: route.entity.name, url: canonical, description: strip(route.entity.description) } };
    default:
      return { title: route.entity.name, description: route.entity.summary || strip(route.entity.content), alternates: { canonical }, openGraph: { images: route.entity.image?.url ? [route.entity.image.url] : undefined } };
  }
}

export default async function EntityPage({ params, searchParams }: Props) {
  const path = toRequestPath((await params).slug);
  if (path === "/products" || path === "/products/") {
    redirect("/search");
  }
  if (path.startsWith("/products/")) {
    redirect(path.replace(/^\/products\//, "/product/"));
  }
  if (path === "/راهنمای-سایزبندی" || path === "/راهنمای-سایز") {
    redirect("/size-guide");
  }
  const sp = await searchParams;
  const r = await resolveRoute(path);
  if (r.error) {
    if (r.error.status === 404) notFound();
    return <ErrorState error={r.error} />;
  }
  const route = r.data;
  switch (route.entityType) {
    case "product":
      return <ProductPage product={route.entity} productId={route.entityId} path={path} />;
    case "product_category":
      return <CategoryPage category={route.entity} categoryId={route.entityId} path={path} sp={sp} />;
    case "cms_page":
      return <CmsPageView page={route.entity} />;
    case "blog_page":
      return <CmsPageView page={route.entity} blog />;
    default:
      notFound();
  }
}
