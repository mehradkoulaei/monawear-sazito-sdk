import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/checkout/payment-result";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
  robots: { index: false },
};

export default function ResultPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-14">
      <Suspense fallback={null}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
