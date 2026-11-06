import Image from "next/image";
import type { BlogPage, CmsPage } from "@sazito/client-sdk";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";

export function CmsPageView({ page, blog }: { page: CmsPage | BlogPage; blog?: boolean }) {
  return (
    <>
      <Breadcrumbs items={[...(blog ? [{ name: "وبلاگ" }] : []), { name: page.name }]} />
      <article className="container max-w-3xl pb-10 pt-2">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">{page.name}</h1>
        {blog && page.createdAt && <p className="mb-6 text-xs text-muted-foreground">{formatDate(page.createdAt)}</p>}
        {page.image?.url && <div className="relative mb-8 aspect-[16/9] overflow-hidden bg-muted"><Image src={page.image.url} alt={page.image.alt || page.name} fill sizes="768px" className="object-cover" /></div>}
        <div className="cms-content leading-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content ?? "") }} />
      </article>
    </>
  );
}
