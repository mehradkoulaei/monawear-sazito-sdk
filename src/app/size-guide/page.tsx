import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InteractiveSizeCalculator } from "@/components/products/interactive-size-calculator";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "راهنمای سایز و محاسبه‌گر هوشمند",
  description: "راهنمای دقیق سایزبندی پوشاک مونا و محاسبه‌گر هوشمند اندازه بر اساس دور سینه، کمر و باسن.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "راهنمای سایز" }]} />
      <main className="container max-w-5xl pb-16 pt-4">
        <header className="mb-8 text-center sm:text-start">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            راهنمای جامع سایزبندی و اندازه‌گیری
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            برای تجربه خریدی بی‌نقص، اندازه‌های خود را در محاسبه‌گر هوشمند وارد کنید یا از جدول راهنما کمک بگیرید.
          </p>
        </header>

        <InteractiveSizeCalculator />
      </main>
    </>
  );
}
