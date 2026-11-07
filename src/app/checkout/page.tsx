import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { getGeneral, getJwt, getRegions } from "@/lib/sazito/services";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "ثبت و نهایی‌سازی سفارش | پوشاک مونا",
  description: "درگاه امن ثبت اطلاعات، انتخاب روش ارسال و پرداخت سفارش در فروشگاه اینترنتی پوشاک مونا.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const [jwt, reg, gen] = await Promise.all([
    getJwt(),
    getRegions(),
    getGeneral(),
  ]);

  return (
    <div className="shopping-page container py-8">
      <h1 className="mb-8 text-3xl font-bold">ثبت سفارش</h1>
      <CheckoutFlow
        loggedIn={!!jwt}
        initialRegions={reg.data ?? []}
        initialGeneral={gen.data ?? null}
      />
    </div>
  );
}
