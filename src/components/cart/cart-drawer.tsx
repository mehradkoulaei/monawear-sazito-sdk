"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";
import { CartLines } from "./cart-lines";
import { formatNumber, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { open, setOpen, cart, count } = useCart();
  const empty = !cart || cart.items.length === 0;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="end" title={`سبد خرید${count ? ` (${formatNumber(count)})` : ""}`}>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
            <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
            <Button asChild variant="outline" onClick={() => setOpen(false)}><Link href="/search">ادامه خرید</Link></Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5"><CartLines onNavigate={() => setOpen(false)} /></div>
            <div className="space-y-3 border-t p-5">
              <div className="flex justify-between text-sm"><span>جمع سبد خرید</span><span className="font-semibold">{formatPrice(cart.netTotal)}</span></div>
              {cart.minBasketLimitViolated && <p className="text-xs text-destructive">مبلغ سبد خرید کمتر از حداقل سفارش فروشگاه است.</p>}
              <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}><Link href="/checkout">ادامه و ثبت سفارش</Link></Button>
              <Button asChild variant="ghost" className="w-full" onClick={() => setOpen(false)}><Link href="/cart">مشاهده سبد خرید</Link></Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
