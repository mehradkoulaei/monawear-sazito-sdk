import Image from "next/image";
import Link from "next/link";
import type { BlogPage, CmsPage } from "@sazito/client-sdk";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

export function CmsPageView({ page, blog }: { page: CmsPage | BlogPage; blog?: boolean }) {
  const pageTitle = (page as any)?.title || page?.name || (blog ? "وبلاگ" : "صفحه");
  const isOrderTrackingPage = (page as any)?.url?.includes("پیگیری") || pageTitle.includes("پیگیری");

  return (
    <>
      <Breadcrumbs items={[...(blog ? [{ name: "وبلاگ" }] : []), { name: pageTitle }]} />
      <article className="container max-w-3xl pb-12 pt-3">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">{pageTitle}</h1>
        {blog && page.createdAt && <p className="mb-6 text-xs text-muted-foreground">{formatDate(page.createdAt)}</p>}
        {page.image?.url && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-sm">
            <Image src={page.image.url} alt={page.image.alt || pageTitle} fill sizes="768px" className="object-cover" />
          </div>
        )}
        <div className="cms-content leading-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content ?? "") }} />

        {isOrderTrackingPage && (
          <div className="mt-10 rounded-2xl border border-burgundy/20 bg-secondary/40 p-6 text-center sm:p-8">
            <h3 className="text-lg font-bold text-foreground">می‌خواهید وضعیت لحظه‌ای سفارش خود را ببینید؟</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-6">
              با وارد کردن شماره سفارش یا شماره همراه خود در سامانه رهگیری هوشمند مونا، وضعیت مرسوله را مشاهده کنید.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/order-tracking"
                className="inline-flex items-center gap-2 rounded-xl bg-burgundy px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-burgundy/90 active:scale-[0.98]"
              >
                <Search className="h-4 w-4" />
                ورود به سامانه پیگیری سفارش
              </Link>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
