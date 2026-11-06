"use client";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { SORT_OPTIONS } from "@/lib/listing";
import { siteConfig } from "@/config/site";
import { formatNumber } from "@/lib/utils";

function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const push = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    q.delete("page");
    for (const [k, v] of Object.entries(patch)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    const s = q.toString();
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };
  return { sp, push, pathname, router };
}

function FilterFields({ showSort }: { showSort: boolean }) {
  const { sp, push } = useNav();
  const [min, setMin] = React.useState(sp.get("min") ?? "");
  const [max, setMax] = React.useState(sp.get("max") ?? "");
  React.useEffect(() => { setMin(sp.get("min") ?? ""); setMax(sp.get("max") ?? ""); }, [sp]);
  return (
    <div className="space-y-7">
      {showSort && (
        <div>
          <label htmlFor="sort" className="mb-2 block text-sm font-semibold">مرتب‌سازی</label>
          <Select id="sort" value={sp.get("sort") ?? "newest"} onChange={(e) => push({ sort: e.target.value === "newest" ? undefined : e.target.value })}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">محدوده قیمت ({siteConfig.currencyLabel})</legend>
        <div className="flex items-center gap-2">
          <Input inputMode="numeric" placeholder="از" aria-label="حداقل قیمت" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} />
          <span>–</span>
          <Input inputMode="numeric" placeholder="تا" aria-label="حداکثر قیمت" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} />
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => push({ min: min || undefined, max: max || undefined })}>اعمال قیمت</Button>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold">وضعیت</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[hsl(var(--burgundy))]" checked={sp.get("stock") === "1"} onChange={(e) => push({ stock: e.target.checked ? "1" : undefined })} />فقط کالاهای موجود</label>
        <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[hsl(var(--burgundy))]" checked={sp.get("discounted") === "1"} onChange={(e) => push({ discounted: e.target.checked ? "1" : undefined })} />فقط تخفیف‌دارها</label>
      </fieldset>
    </div>
  );
}

export function ActiveFilters() {
  const { sp, push } = useNav();
  const chips: Array<{ label: string; patch: Record<string, undefined> }> = [];
  if (sp.get("min")) chips.push({ label: `از ${formatNumber(Number(sp.get("min")))}`, patch: { min: undefined } });
  if (sp.get("max")) chips.push({ label: `تا ${formatNumber(Number(sp.get("max")))}`, patch: { max: undefined } });
  if (sp.get("stock") === "1") chips.push({ label: "موجود", patch: { stock: undefined } });
  if (sp.get("discounted") === "1") chips.push({ label: "تخفیف‌دار", patch: { discounted: undefined } });
  if (!chips.length) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.label} onClick={() => push(c.patch)} className="flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs hover:bg-muted">{c.label}<X className="h-3 w-3" /></button>
      ))}
      <button onClick={() => push({ min: undefined, max: undefined, stock: undefined, discounted: undefined })} className="text-xs text-burgundy underline">پاک کردن همه فیلترها</button>
    </div>
  );
}

/** Desktop sidebar */
export function FilterSidebar({ showSort }: { showSort: boolean }) {
  return <aside className="hidden w-64 shrink-0 lg:block" aria-label="فیلترها"><div className="sticky top-28"><FilterFields showSort={showSort} /></div></aside>;
}

/** Mobile drawer + sort */
export function MobileFilterButton({ showSort }: { showSort: boolean }) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild><Button variant="outline" size="sm"><SlidersHorizontal className="h-4 w-4" />فیلتر و مرتب‌سازی</Button></SheetTrigger>
        <SheetContent side="start" title="فیلتر و مرتب‌سازی">
          <div className="flex-1 overflow-y-auto px-5"><FilterFields showSort={showSort} /></div>
          <div className="border-t p-4"><SheetClose asChild><Button className="w-full">مشاهده نتایج</Button></SheetClose></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function DesktopSort() {
  const { sp, push } = useNav();
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <label htmlFor="sort-d" className="text-sm text-muted-foreground">مرتب‌سازی:</label>
      <Select id="sort-d" className="h-9 w-44" value={sp.get("sort") ?? "newest"} onChange={(e) => push({ sort: e.target.value === "newest" ? undefined : e.target.value })}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </div>
  );
}
