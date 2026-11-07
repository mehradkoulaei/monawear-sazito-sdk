import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "سبد خرید | پوشاک مونا",
  description: "مشاهده، بررسی اقلام انتخابی و نهایی‌سازی سفارش در فروشگاه اینترنتی پوشاک مونا.",
  path: "/cart",
  noIndex: true,
});
export default function CartPage() {
  return <div className="shopping-page container py-8"><h1 className="mb-8 text-3xl font-bold">سبد خرید</h1><CartPageClient /></div>;
}
