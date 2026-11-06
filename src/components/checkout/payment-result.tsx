"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Order, PaymentAction } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { sazitoFetch } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

/** Never marks a payment as successful on its own: status comes from Sazito (via the return route or payments/status). */
export function PaymentResult() {
  const sp = useSearchParams();
  const { refresh } = useCart();
  const [status, setStatus] = React.useState(sp.get("status") ?? "error");
  const [orderNo, setOrderNo] = React.useState(sp.get("order") ?? "");
  const [orderId, setOrderId] = React.useState(sp.get("id") ?? "");
  const [identifier, setIdentifier] = React.useState(sp.get("identifier") ?? "");
  const [message, setMessage] = React.useState(sp.get("message") ?? "");
  const [order, setOrder] = React.useState<Order | null>(null);

  // poll payments/status while pending (each poll is a separate visible request)
  React.useEffect(() => {
    if (status !== "pending") return;
    let stop = false;
    const started = Date.now();
    const tick = async () => {
      if (stop) return;
      if (Date.now() - started > 5 * 60 * 1000) { setStatus("failed"); setMessage("زمان بررسی پرداخت به پایان رسید. وضعیت سفارش را از حساب کاربری بررسی کنید."); return; }
      const r = await sazitoFetch<PaymentAction>("payments/status");
      if (stop) return;
      if (r.data?.action === "show_order") {
        setStatus("success");
        if (r.data.order) { setOrderNo(String(r.data.order.orderNumber)); setOrderId(String(r.data.order.id)); setIdentifier(r.data.order.orderIdentifier); }
        return;
      }
      if (r.data && r.data.action !== "pending") { setStatus("failed"); setMessage(("message" in r.data && r.data.message) || "پرداخت ناموفق بود."); return; }
      setTimeout(tick, 5000);
    };
    const t = setTimeout(tick, 3000);
    return () => { stop = true; clearTimeout(t); };
  }, [status]);

  React.useEffect(() => {
    if (status !== "success") return;
    refresh();
    if (orderId && identifier) sazitoFetch<Order>("orders/get", { query: { orderId, orderIdentifier: identifier } }).then((r) => r.data && setOrder(r.data));
  }, [status, orderId, identifier, refresh]);

  const Icon = status === "success" ? CheckCircle2 : status === "pending" ? Clock : XCircle;
  const title = status === "success" ? "سفارش شما ثبت شد" : status === "pending" ? "در حال بررسی پرداخت…" : "پرداخت انجام نشد";
  return (
    <div className="mx-auto max-w-xl text-center">
      <Icon className={status === "success" ? "mx-auto mb-4 h-16 w-16 text-emerald-600" : status === "pending" ? "mx-auto mb-4 h-16 w-16 animate-pulse text-burgundy" : "mx-auto mb-4 h-16 w-16 text-destructive"} strokeWidth={1.25} />
      <h1 className="mb-3 text-2xl font-bold">{title}</h1>
      {orderNo && <p className="mb-2">شماره سفارش: <strong>{orderNo}</strong></p>}
      {message && <p className="mb-4 text-sm text-muted-foreground">{message}</p>}
      {status === "pending" && <p className="text-sm text-muted-foreground">لطفاً این صفحه را نبندید.</p>}
      {order?.invoice && (
        <div className="mt-6 border bg-card p-5 text-start text-sm">
          <ul className="space-y-2">{order.invoice.invoiceItems.map((i, k) => <li key={k} className="flex justify-between gap-3"><span>{i.name} × {i.quantity}</span><span>{formatPrice(i.lineTotal)}</span></li>)}</ul>
          {order.invoice.finalTotal !== undefined && <p className="mt-4 flex justify-between border-t pt-3 font-bold"><span>مبلغ نهایی</span><span>{formatPrice(order.invoice.finalTotal)}</span></p>}
        </div>
      )}
      <div className="mt-8 flex justify-center gap-3">
        {status === "success" && orderId && identifier && <Button asChild variant="outline"><Link href={`/order-tracking?id=${encodeURIComponent(orderId)}&identifier=${encodeURIComponent(identifier)}`}>پیگیری سفارش</Link></Button>}
        {status === "failed" || status === "error" ? <Button asChild><Link href="/checkout">بازگشت به پرداخت</Link></Button> : null}
        <Button asChild variant={status === "success" ? "default" : "ghost"}><Link href="/">صفحه اصلی</Link></Button>
      </div>
    </div>
  );
}
