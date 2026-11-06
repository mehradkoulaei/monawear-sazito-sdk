import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderView } from "@/components/account/order-view";
import { OrderFeedback } from "@/components/account/order-feedback";
import { ErrorState } from "@/components/state";
import { getGeneral, getMyOrder } from "@/lib/sazito/services";
import type { SP } from "@/lib/listing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "جزئیات سفارش", robots: { index: false } };

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  const identifier = (Array.isArray(sp.identifier) ? sp.identifier[0] : sp.identifier) ?? "";
  const [r, general] = await Promise.all([getMyOrder(id, identifier), getGeneral()]);
  if (!r) redirect(`/account?next=/account/orders/${id}`);
  if (r.error) return <ErrorState error={r.error} title="سفارش پیدا نشد" />;
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">جزئیات سفارش</h1>
      <OrderView order={r.data} />
      {general.data?.settings?.tajrobe?.enabled && <OrderFeedback orderIdentifier={r.data.orderIdentifier} />}
    </div>
  );
}
