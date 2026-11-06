import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { OrderView } from "@/components/account/order-view";
import { OrderTrackingForm } from "@/components/account/order-tracking-form";
import { ErrorState } from "@/components/state";
import { getOrderByIdentifier } from "@/lib/sazito/services";
import type { SP } from "@/lib/listing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پیگیری سفارش", robots: { index: false } };

export default async function OrderTrackingPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const id = (Array.isArray(sp.id) ? sp.id[0] : sp.id)?.trim();
  const identifier = (Array.isArray(sp.identifier) ? sp.identifier[0] : sp.identifier)?.trim();
  const r = id && identifier ? await getOrderByIdentifier(id, identifier) : null;
  return (
    <>
      <Breadcrumbs items={[{ name: "پیگیری سفارش" }]} />
      <div className="container max-w-2xl pb-10 pt-2">
        <h1 className="mb-2 text-3xl font-bold">پیگیری سفارش</h1>
        <p className="mb-6 text-sm text-muted-foreground">شماره و شناسه سفارش را که پس از ثبت سفارش دریافت کرده‌اید وارد کنید. کاربران واردشده می‌توانند سفارش‌ها را از حساب کاربری ببینند.</p>
        <OrderTrackingForm defaultId={id} defaultIdentifier={identifier} />
        <div className="mt-10">
          {r?.error ? <ErrorState error={r.error} title="سفارش پیدا نشد" /> : r?.data ? <OrderView order={r.data} /> : null}
        </div>
      </div>
    </>
  );
}
