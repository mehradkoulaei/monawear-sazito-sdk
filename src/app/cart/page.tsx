import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page";
export const metadata: Metadata = { title: "سبد خرید", robots: { index: false } };
export default function CartPage() {
  return <div className="shopping-page container py-8"><h1 className="mb-8 text-3xl font-bold">سبد خرید</h1><CartPageClient /></div>;
}
