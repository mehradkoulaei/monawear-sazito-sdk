import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { getGeneral, getJwt, getRegions } from "@/lib/sazito/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ثبت سفارش", robots: { index: false } };

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
