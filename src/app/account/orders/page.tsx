import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, ErrorState } from "@/components/state";
import { listMyOrders } from "@/lib/sazito/services";
import { formatPrice } from "@/lib/utils";
import type { SP } from "@/lib/listing";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "سفارش‌های من",
  description: "مشاهده تاریخچه سفارش‌ها، وضعیت ارسال و فاکتور خرید در پوشاک مونا.",
  path: "/account/orders",
  noIndex: true,
});

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const r = await listMyOrders(page);
  if (!r) redirect("/account?next=/account/orders");
  if (r.error) return <ErrorState error={r.error} />;
  const orders = r.data.orders;
  const pages = Math.ceil(r.data.totalCount / 10);
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">سفارش‌های من</h1>
      {orders.length === 0 ? <EmptyState title="هنوز سفارشی ثبت نکرده‌اید" /> : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}?identifier=${encodeURIComponent(o.orderIdentifier)}`} className="flex items-center justify-between border bg-card p-5 hover:border-foreground">
                <div><p className="font-semibold">سفارش {o.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{o.invoice.invoiceItems.length} قلم کالا</p></div>
                <span className="text-sm">{formatPrice(o.invoice.finalTotal)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && <div className="mt-8 flex justify-center gap-2">{page > 1 && <Link className="border px-4 py-2 text-sm" href={`?page=${page - 1}`}>قبلی</Link>}{page < pages && <Link className="border px-4 py-2 text-sm" href={`?page=${page + 1}`}>بعدی</Link>}</div>}
    </div>
  );
}
