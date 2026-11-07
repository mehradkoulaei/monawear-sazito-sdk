import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CategoryPage } from "@/components/products/category-page";
import { ProductPage } from "@/components/products/product-page";
import { CmsPageView } from "@/components/cms-page";
import { ErrorState } from "@/components/state";
import { resolveRoute } from "@/lib/sazito/services";
import type { SP } from "@/lib/listing";
import { toPath } from "@/lib/utils";
import {
  buildProductMetadata,
  buildCategoryMetadata,
  buildCmsMetadata,
  buildMetadata,
} from "@/lib/metadata";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<SP> };

function toRequestPath(slug: string[]): string {
  return "/" + slug.map((s) => { try { return decodeURIComponent(s); } catch { return s; } }).join("/");
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const path = toRequestPath((await params).slug);
  if (path === "/products" || path.startsWith("/products/")) {
    return buildMetadata({
      title: "همه محصولات | پوشاک مونا",
      description: "مشاهده تمام کالکشن‌ها و مدل‌های پوشاک زنانه، لباس خواب و بادی در پوشاک مونا.",
      path: "/search",
    });
  }
  const r = await resolveRoute(path);
  const route = r.data;
  if (!route || route.entityType === "unknown") {
    return buildMetadata({
      title: "صفحه پیدا نشد | پوشاک مونا",
      description: "صفحه مورد نظر در فروشگاه پوشاک مونا یافت نشد.",
      noIndex: true,
    });
  }
  const canonical = toPath(route.url || path);
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  switch (route.entityType) {
    case "product":
      return buildProductMetadata(route.entity, canonical);
    case "product_category":
      return buildCategoryMetadata(route.entity, canonical, filtered);
    case "blog_page":
      return buildCmsMetadata(route.entity, canonical, true);
    case "cms_page":
    default:
      return buildCmsMetadata(route.entity, canonical, false);
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
