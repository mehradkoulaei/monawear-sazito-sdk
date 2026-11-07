import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/checkout/payment-result";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "نتیجه و وضعیت پرداخت سفارش",
  description: "رسید رسمی و اطلاعات وضعیت پرداخت سفارش در فروشگاه اینترنتی پوشاک مونا.",
  path: "/checkout/result",
  noIndex: true,
});

export default function ResultPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-14">
      <Suspense fallback={null}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
