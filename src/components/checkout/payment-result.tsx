"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Copy,
  Clock,
  XCircle,
  Package,
  RotateCcw,
  ArrowUpRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import type { Order, PaymentAction } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { sazitoFetch } from "@/lib/api/client";
import { formatNumber, formatPrice } from "@/lib/utils";

const TIMELINE_STEPS = [
  { id: 1, label: "ثبت سفارش", desc: "پرداخت تأیید شد", done: true },
  { id: 2, label: "پردازش و بسته‌بندی", desc: "انبار مونا", current: true },
  { id: 3, label: "تحویل به پست", desc: "صدور بارنامه", done: false },
  { id: 4, label: "تحویل مرسوله", desc: "نشانی خریدار", done: false },
];

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

  // Poll status while pending
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
      <div className="mx-auto max-w-lg py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
            <Clock className="h-6 w-6 animate-spin text-burgundy" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            در حال دریافت تأییدیه پرداخت
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            ارتباط با درگاه بانکی در حال پردازش است. لطفاً پنجره را نبندید.
          </p>
          {orderNo && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3.5 py-1.5 text-xs text-muted-foreground font-mono">
              <span>سفارش</span>
              <span className="font-semibold text-foreground">#{orderNo}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <XCircle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            تراکنش ناموفق بود
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {message || "پرداخت توسط بانک تکمیل نشد یا ارتباط با درگاه قطع شد."}
          </p>
          <div className="mt-8 flex flex-col-reverse justify-center gap-2.5 sm:flex-row">
            <Button asChild variant="outline" className="h-11 rounded-xl px-6 text-sm">
              <Link href="/cart">بازگشت به سبد خرید</Link>
            </Button>
            <Button asChild className="h-11 rounded-xl bg-burgundy px-6 text-sm text-white hover:bg-burgundy/90">
              <Link href="/checkout">
                <RotateCcw className="ml-2 h-4 w-4" strokeWidth={1.75} />
                تلاش مجدد
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Unslopped Luxury Thank You View
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Receipt Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-8 shadow-xs">
        {/* Header: Quiet confirmation */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Check className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-foreground">
                سفارش شما با موفقیت ثبت شد
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                رسید دیجیتال و جزئیات آماده‌سازی مرسوله مونا
              </p>
            </div>
          </div>

          {orderNo && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">کد پیگیری:</span>
              <span className="font-mono font-bold text-foreground tracking-wide">
                #{Number(orderNo) ? formatNumber(Number(orderNo)) : orderNo}
              </span>
              <button
                type="button"
                onClick={copyOrderNo}
                className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
                title="کپی کد سفارش"
                aria-label="کپی کد سفارش"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Narrative */}
        <div className="py-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
          سفارش شما در سیستم ثبت شد و اطلاعات آن به واحد بسته‌بندی ارسال گردید. به محض تحویل مرسوله به شرکت پست، کد رهگیری پستی به همراه جزئیات ارسال برای شما فعال خواهد شد.
        </div>

        {/* Quiet Minimal Stepper */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground mb-3.5">وضعیت لحظه‌ای سفارش</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TIMELINE_STEPS.map((s) => (
              <div key={s.id} className="relative flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono ${
                      s.done
                        ? "bg-emerald-600 text-white"
                        : s.current
                        ? "bg-burgundy text-white ring-2 ring-burgundy/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {s.done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : s.id}
                  </span>
                  <span
                    className={`text-xs font-medium truncate ${
                      s.current ? "text-burgundy font-semibold" : s.done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground pr-7 leading-normal">
                  {s.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items Table (if available) */}
        {order?.invoice && order.invoice.invoiceItems.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-6">
            <div className="flex items-center justify-between mb-3 text-xs font-medium text-muted-foreground">
              <span>اقلام سفارش</span>
              <span className="tabular-nums">{formatNumber(order.invoice.invoiceItems.length)} قلم</span>
            </div>
            <div className="divide-y divide-border/40 text-sm">
              {order.invoice.invoiceItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <span className="text-foreground">
                    {item.name} <span className="text-xs text-muted-foreground">× {formatNumber(item.quantity)}</span>
                  </span>
                  <span className="font-mono text-xs tabular-nums text-foreground">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {order.invoice.finalTotal !== undefined && (
              <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold text-foreground">
                <span>مبلغ نهایی پرداختی</span>
                <span className="font-mono text-base text-burgundy tabular-nums">
                  {formatPrice(order.invoice.finalTotal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer Notes */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>ضمانت اصالت و سلامت فیزیکی پوشاک مونا</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>پشتیبانی تلگرام و اینستاگرام: monawear_ir</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button asChild variant="outline" className="h-11 rounded-xl px-6 text-sm">
          <Link href="/">
            بازگشت به فروشگاه
          </Link>
        </Button>

        {orderId && identifier ? (
          <Button asChild className="h-11 rounded-xl bg-burgundy px-6 text-sm text-white hover:bg-burgundy/90 shadow-2xs">
            <Link href={`/order-tracking?id=${encodeURIComponent(orderId)}&identifier=${encodeURIComponent(identifier)}`}>
              <Package className="ml-2 h-4 w-4" strokeWidth={1.75} />
              پیگیری وضعیت مرسوله
            </Link>
          </Button>
        ) : (
          <Button asChild className="h-11 rounded-xl bg-burgundy px-6 text-sm text-white hover:bg-burgundy/90 shadow-2xs">
            <Link href="/order-tracking">
              <Package className="ml-2 h-4 w-4" strokeWidth={1.75} />
              پیگیری سفارشات
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
