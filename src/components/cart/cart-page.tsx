"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "./cart-provider";
import { CartLines } from "./cart-lines";
import { formatPrice } from "@/lib/utils";

export function CartPageClient() {
  const { cart, isLoading } = useCart();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!cart || cart.items.length === 0)
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" strokeWidth={1} />
        <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
        <Button asChild variant="outline"><Link href="/search">شروع خرید</Link></Button>
      </div>
    );
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <CartLines />
      <aside className="order-summary h-fit space-y-4 border bg-card p-6 lg:sticky lg:top-40">
        <h2 className="font-semibold">خلاصه سفارش</h2>
        <div className="flex justify-between text-sm"><span>جمع کالاها</span><span>{formatPrice(cart.netTotal)}</span></div>
        <p className="text-xs text-muted-foreground">هزینه ارسال و کد تخفیف در مرحله بعد محاسبه می‌شود.</p>
        {cart.minBasketLimitViolated && <p className="text-xs text-destructive">مبلغ سبد خرید کمتر از حداقل سفارش فروشگاه است.</p>}
        <Button asChild size="lg" className="w-full"><Link href="/checkout">ادامه و ثبت سفارش</Link></Button>
      </aside>
    </div>
  );
}
