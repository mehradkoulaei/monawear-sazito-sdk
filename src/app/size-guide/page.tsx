import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InteractiveSizeCalculator } from "@/components/products/interactive-size-calculator";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "راهنمای سایزبندی و محاسبه‌گر هوشمند اندازه | پوشاک مونا",
  description: "راهنمای دقیق انتخاب سایز لباس زنانه، جدول استاندارد اندازه‌ها و محاسبه‌گر هوشمند سایز بر اساس دور سینه، دور کمر و دور باسن در پوشاک مونا.",
  path: "/size-guide",
  images: [
    {
      url: "/images/brand/v2/mona-category-2-studio-1200.webp",
      width: 1200,
      height: 800,
      alt: "راهنمای سایزبندی پوشاک مونا",
      type: "image/webp",
    },
  ],
});

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
