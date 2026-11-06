import { NextRequest, NextResponse } from "next/server";
import type { PaymentAction } from "@sazito/client-sdk";
import { createClient, isConfigured } from "@/lib/sazito/client";
import { COOKIES, CREDENTIAL_KEYS, cookieOptions, diffSession, readSession } from "@/lib/sazito/session";
import { devLog, newRequestId } from "@/lib/sazito/logger";

/**
 * Payment gateway return endpoint (GET or cross-site POST).
 * Gateways that POST back do not send our SameSite=Lax cookies, so payment id/identifier are read from the
 * return URL / form first (what the SDK expects) and only then from the cookie.
 * NOTE: the exact parameter names Sazito appends to the return URL must be confirmed with a live test.
 */
async function handle(request: NextRequest) {
  const site = request.nextUrl.clone();
  const to = (params: Record<string, string>) => {
    const u = new URL("/checkout/result", request.nextUrl.origin);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v.slice(0, 300));
    return NextResponse.redirect(u, 303);
  };
  if (!isConfigured()) return to({ status: "error", message: "اتصال فروشگاه تنظیم نشده است." });

  const query: Record<string, string> = {};
  site.searchParams.forEach((v, k) => { query[k] = v; });
  const body: Record<string, string> = {};
  if (request.method === "POST") {
    try {
      const fd = await request.formData();
      fd.forEach((v, k) => { if (typeof v === "string") body[k] = v; });
    } catch { /* ignore */ }
  }
  const all = { ...body, ...query };
  const pick = (...keys: string[]) => keys.map((k) => all[k]).find((v) => v);

  const session = readSession(request.cookies);
  let paymentId = pick("paymentId", "payment_id", "id");
  let paymentIdentifier = pick("paymentIdentifier", "payment_identifier", "identifier");
  if (!paymentId || !paymentIdentifier) {
    try {
      const c = JSON.parse(session.storage.getItem(CREDENTIAL_KEYS[COOKIES.pay]) || "null");
      paymentId = paymentId || (c?.id !== undefined ? String(c.id) : undefined);
      paymentIdentifier = paymentIdentifier || c?.identifier;
    } catch { /* ignore */ }
  }
  if (!paymentId || !paymentIdentifier) return to({ status: "error", message: "اطلاعات پرداخت پیدا نشد." });

  const rid = newRequestId();
  const client = createClient({ storage: session.storage, fetchCtx: { label: "payments/return", requestId: rid, revalidate: false } });
  const opts = { headers: { "X-Request-ID": rid, ...(session.jwt ? { Authorization: session.jwt } : {}) } };
  const r = await client.payments.verifyPaymentCallback({ paymentId, paymentIdentifier, body, query }, opts);
  devLog(`${request.method.padEnd(6)} /checkout/return ← ${r.error ? "error" : (r.data as PaymentAction).action}  rid=${rid}`);

  let res: NextResponse;
  if (r.error) res = to({ status: "error", message: r.error.message });
  else {
    const a = r.data as PaymentAction;
    if (a.action === "show_order") {
      res = to({ status: "success", ...(a.order ? { order: String(a.order.orderNumber), id: String(a.order.id), identifier: a.order.orderIdentifier } : {}) });
    } else if (a.action === "pending") {
      res = to({ status: "pending", order: String(a.order.orderNumber), id: String(a.order.id), identifier: a.order.orderIdentifier });
    } else {
      res = to({ status: "failed", message: a.message || "پرداخت ناموفق بود." });
    }
  }
  const definite = !r.error || (r.error.type !== "network" && (r.error.status ?? 400) < 500);
  if (definite) {
    for (const ch of diffSession(session)) {
      if (ch.value) res.cookies.set(ch.name, ch.value, cookieOptions(ch.name));
      else res.cookies.set(ch.name, "", { ...cookieOptions(ch.name), maxAge: 0 });
    }
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const GET = handle;
export const POST = handle;
