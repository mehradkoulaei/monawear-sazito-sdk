"use client";
import * as React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/products/product-image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchResponse } from "@sazito/client-sdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { sazitoFetch } from "@/lib/api/client";
import { summarize } from "@/lib/product";
import { formatPrice, toPath } from "@/lib/utils";

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<SearchResponse | null>(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRes(null); setErr(""); setLoading(false); return; }
    setErr("");
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await sazitoFetch<SearchResponse>("search/query", { query: { q: term, pageSize: 6 }, signal: ctl.signal });
      if (ctl.signal.aborted) return;
      setLoading(false);
      if (r.error) { setErr("جستجو در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید."); setRes(null); } else { setErr(""); setRes(r.data); }
    }, 300);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="جستجو" hideTitle className="top-[12%] max-w-3xl translate-y-0 p-0">
        <form onSubmit={go} className="flex items-center gap-3 border-b px-5 pe-12 py-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی محصول، دسته‌بندی…" className="min-w-0 flex-1 bg-transparent text-base outline-none" aria-label="عبارت جستجو" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="پاک کردن"><X className="h-4 w-4" /></button>}
        </form>
        <div className="min-h-[120px] px-5 py-5" aria-live="polite" aria-busy={loading}>
          {q.trim().length < 2 && <div><p className="mb-4 text-sm text-muted-foreground">برای جستجو، دست‌کم دو حرف بنویسید.</p><div className="flex flex-wrap gap-2">{[{ label: "همه محصولات", href: "/search" }, { label: "تازه‌های مونا", href: "/search?sort=newest" }, { label: "تخفیف‌ها", href: "/search?discounted=1" }].map((link) => <Link key={link.href} href={link.href} onClick={() => onOpenChange(false)} className="border px-4 py-2 text-xs text-burgundy hover:bg-secondary">{link.label}</Link>)}</div></div>}
          {loading && <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[3/4]" />)}</div>}
          {err && <p className="py-6 text-center text-sm text-destructive">{err}</p>}
          {!loading && !err && res && (
            <>
              {res.productCategories.items.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {res.productCategories.items.slice(0, 5).map((c) => (
                    <Link key={c.url} href={toPath(c.url)} onClick={() => onOpenChange(false)} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">{c.name}</Link>
                  ))}
                </div>
              )}
              {res.products.items.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">نتیجه‌ای پیدا نشد.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {res.products.items.map((p) => {
                    const s = summarize(p);
                    return (
                      <li key={p.id}>
                        <Link href={toPath(p.url)} onClick={() => onOpenChange(false)} className="group block">
                          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                            {p.images?.[0]?.url && <ProductImage src={p.images[0].url} alt={p.images[0].alt || p.name} sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                          </div>
                          <p className="mt-2 line-clamp-1 text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(s.price)}</p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {res.products.total > 0 && (
                <button onClick={go} className="mt-4 w-full border py-2.5 text-sm hover:bg-muted">مشاهده همه نتایج ({new Intl.NumberFormat("fa-IR").format(res.products.total)})</button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
