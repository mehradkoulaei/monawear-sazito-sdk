"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import type { Order, PaymentAction } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { sazitoFetch } from "@/lib/api/client";
import { formatNumber, formatPrice } from "@/lib/utils";

export function PaymentResult() {
  const sp = useSearchParams();
  const { refresh } = useCart();
  const [status, setStatus] = React.useState(sp.get("status") ?? "error");
  const [orderNo, setOrderNo] = React.useState(sp.get("order") ?? "");
  const [orderId, setOrderId] = React.useState(sp.get("id") ?? "");
  const [identifier, setIdentifier] = React.useState(sp.get("identifier") ?? "");
  const [message, setMessage] = React.useState(sp.get("message") ?? "");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Poll payments/status while pending
  React.useEffect(() => {
    if (status !== "pending") return;
    let stop = false;
    const started = Date.now();
    const tick = async () => {
      if (stop) return;
      if (Date.now() - started > 5 * 60 * 1000) {
        setStatus("failed");
        setMessage("زمان بررسی پرداخت به پایان رسید. وضعیت سفارش را از حساب کاربری بررسی کنید.");
        return;
      }
      const r = await sazitoFetch<PaymentAction>("payments/status");
      if (stop) return;
      if (r.data?.action === "show_order") {
        setStatus("success");
        if (r.data.order) {
          setOrderNo(String(r.data.order.orderNumber));
          setOrderId(String(r.data.order.id));
          setIdentifier(r.data.order.orderIdentifier);
        }
        return;
      }
      if (r.data && r.data.action !== "pending") {
        setStatus("failed");
        setMessage(("message" in r.data && r.data.message) || "پرداخت ناموفق بود.");
        return;
      }
      setTimeout(tick, 5000);
    };
    const t = setTimeout(tick, 3000);
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [status]);

  React.useEffect(() => {
    if (status !== "success") return;
    refresh();
    if (orderId && identifier) {
      sazitoFetch<Order>("orders/get", {
        query: { orderId, orderIdentifier: identifier },
      }).then((r) => r.data && setOrder(r.data));
    }
  }, [status, orderId, identifier, refresh]);

  const copyOrderNo = () => {
    if (!orderNo) return;
    navigator.clipboard?.writeText(orderNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = status === "success";
  const isPending = status === "pending";

  if (isPending) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-3xl border border-burgundy/15 bg-card/80 p-8 shadow-xs md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
            <Clock className="h-10 w-10 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            در حال تأیید پرداخت...
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            لطفاً چند لحظه شکیبا باشید و این صفحه را نبندید. اطلاعات تراکنش در حال بررسی است.
          </p>
          {orderNo && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-burgundy/20 bg-burgundy/5 px-4 py-1.5 text-sm font-semibold text-burgundy">
              <span>شماره سفارش:</span>
              <span className="font-mono">{Number(orderNo) ? formatNumber(Number(orderNo)) : orderNo}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-3xl border border-destructive/20 bg-card/80 p-8 shadow-xs md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            پرداخت انجام نشد
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            {message || "تراکنش توسط کاربر لغو شد یا پاسخی از درگاه بانکی دریافت نگردید."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-burgundy text-white hover:bg-burgundy/90">
              <Link href="/checkout">
                <RotateCcw className="ml-2 h-4 w-4" />
                تلاش مجدد برای پرداخت
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/cart">بازگشت به سبد خرید</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success: Luxury Thank You Page
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Hero Thank You Card */}
      <section className="relative overflow-hidden rounded-3xl border border-burgundy/15 bg-gradient-to-b from-burgundy/[0.04] via-card to-card p-6 text-center shadow-xs md:p-12">
        {/* Glow & Pattern Accents */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-burgundy/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          {/* Animated checkmark badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 bg-burgundy/5 px-3 py-1 text-xs font-semibold text-burgundy mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>خرید شما با موفقیت ثبت شد</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            از خرید شما سپاسگزاریم!
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed md:text-base">
            سفارش شما با موفقیت در سیستم پوشاک مونا ثبت گردید و هم‌اکنون همکاران ما در واحد بسته‌بندی در حال آماده‌سازی مرسوله شما هستند.
          </p>

          {/* Order Number Pill with Copy */}
          {orderNo && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm shadow-2xs">
                <span className="text-muted-foreground">کد پیگیری سفارش:</span>
                <span className="font-mono text-base font-bold text-foreground">#{Number(orderNo) ? formatNumber(Number(orderNo)) : orderNo}</span>
                <button
                  type="button"
                  onClick={copyOrderNo}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
                  title="کپی شماره سفارش"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-sans">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="font-sans">کپی</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Journey Timeline */}
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-2xs md:p-8">
        <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground md:text-lg">
          <Truck className="h-5 w-5 text-burgundy" />
          <span>مراحل آماده‌سازی و ارسال سفارش</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-4">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">تأیید سفارش</span>
            <span className="mt-1 text-[11px] text-muted-foreground">پرداخت با موفقیت انجام شد</span>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-burgundy/5 border border-burgundy/20">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-burgundy text-white shadow-2xs">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-burgundy">بسته‌بندی در انبار</span>
            <span className="mt-1 text-[11px] text-muted-foreground">در حال کنترل کیفیت و آماده‌سازی</span>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-muted/40 border border-border">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">تحویل به شرکت پست</span>
            <span className="mt-1 text-[11px] text-muted-foreground">صدور بارنامه و کد رهگیری پستی</span>
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col items-center text-center p-3 rounded-2xl bg-muted/40 border border-border">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">تحویل به شما</span>
            <span className="mt-1 text-[11px] text-muted-foreground">تحویل درب منزل با نهایت احترام</span>
          </div>
        </div>
      </section>

      {/* Invoice Details if loaded */}
      {order?.invoice && (
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-2xs md:p-8">
          <h2 className="mb-4 flex items-center justify-between text-base font-bold text-foreground md:text-lg">
            <span>اقلام خریداری‌شده</span>
            <span className="text-xs font-normal text-muted-foreground">
              {formatNumber(order.invoice.invoiceItems.length)} کالا
            </span>
          </h2>

          <div className="divide-y divide-border/60">
            {order.invoice.invoiceItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                    {formatNumber(idx + 1)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">تعداد: {formatNumber(item.quantity)} عدد</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {order.invoice.finalTotal !== undefined && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-base font-bold">
              <span className="text-foreground">مبلغ پرداختی نهایی:</span>
              <span className="text-lg text-burgundy">{formatPrice(order.invoice.finalTotal)}</span>
            </div>
          )}
        </section>
      )}

      {/* Guarantee & Support Box */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600 mt-0.5" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <strong className="block text-sm font-semibold text-foreground mb-1">ضمانت اصالت و سلامت مونا</strong>
            تمامی محصولات قبل از ارسال توسط کارشناسان کنترل کیفی مونا بررسی و در بسته‌بندی بهداشتی قرار می‌گیرند.
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4">
          <Headphones className="h-6 w-6 shrink-0 text-burgundy mt-0.5" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <strong className="block text-sm font-semibold text-foreground mb-1">نیاز به راهنمایی یا تغییر دارید؟</strong>
            تیم پشتیبانی مونا در تلگرام و اینستاگرام آماده پاسخگویی سریع به سؤالات شما درباره سفارش است.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-center justify-center gap-3 pt-2 sm:flex-row">
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8">
          <Link href="/">
            بازگشت به صفحه اصلی
          </Link>
        </Button>

        {orderId && identifier ? (
          <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-burgundy px-8 text-white hover:bg-burgundy/90 shadow-sm">
            <Link href={`/order-tracking?id=${encodeURIComponent(orderId)}&identifier=${encodeURIComponent(identifier)}`}>
              <Package className="ml-2 h-4 w-4" />
              رهگیری مستقیم مرسوله
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-burgundy px-8 text-white hover:bg-burgundy/90 shadow-sm">
            <Link href="/order-tracking">
              <Package className="ml-2 h-4 w-4" />
              پیگیری سفارشات
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
