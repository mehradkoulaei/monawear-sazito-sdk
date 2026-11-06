import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/checkout/payment-result";
export const metadata: Metadata = { title: "نتیجه پرداخت", robots: { index: false } };
export default function ResultPage() {
  return <div className="container py-16"><Suspense fallback={null}><PaymentResult /></Suspense></div>;
}
