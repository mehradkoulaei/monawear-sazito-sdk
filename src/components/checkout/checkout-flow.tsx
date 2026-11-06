"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  PackageCheck,
  ShieldCheck,
  Tag,
  Trash2,
  Truck,
  Wallet as WalletIcon,
} from "lucide-react";
import type {
  ApplicableShippingMethods, GeneralInfo, Invoice, PaymentAction, PaymentMethod, Payment, RegionWithCities, ShippingAddress, User, Wallet,
} from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/products/product-image";
import { attrValue } from "@/lib/product";
import { AddressForm, type AddressValues } from "./address-form";
import { useCart } from "@/components/cart/cart-provider";
import { errorText, sazitoFetch, type ApiError } from "@/lib/api/client";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

type Step = "address" | "shipping" | "payment";
const STEPS: Array<{ id: Step; label: string }> = [{ id: "address", label: "اطلاعات ارسال" }, { id: "shipping", label: "روش ارسال" }, { id: "payment", label: "پرداخت" }];

function formatPaymentTitle(method: PaymentMethod): string {
  const raw = (method.titleFa || method.title || "").trim();
  if (!raw) return "درگاه پرداخت امن";
  // Normalize and fix typo "زرینپال" -> "زرین‌پال" (with Persian half-space \u200C)
  return raw
    .replace(/زرینپال/g, "زرین‌پال")
    .replace(/زرین\s+پال/g, "زرین‌پال");
}

function PaymentGatewayIcon({ method }: { method: PaymentMethod }) {
  const code = (method.code || "").toLowerCase();
  const title = (method.titleFa || method.title || "").toLowerCase();
  const isZarinpal = code.includes("zarinpal") || title.includes("زرین");
  const isZibal = code.includes("zibal") || title.includes("زیبال");

  if (isZarinpal) {
    return (
      <span
        className="icons__icon-zarinpal___GZ_LX icons__icons___db6nw styles__icon___AXdaR relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card p-2 transition-colors"
        aria-label="لوگوی درگاه زرین‌پال"
      >
        <svg viewBox="575 118 122 124" className="h-7 w-7" fill="none" aria-hidden="true">
          <path
            fill="#ffd000"
            d="M634.529 125.971a7.965 7.965 0 0 1 7.394-4.971h51.107c5.634 0 9.484 5.65 7.393 10.844l-39.137 97.149a7.96 7.96 0 0 1-7.393 4.971h-51.107c-5.634 0-9.484-5.651-7.394-10.845z"
          />
          <path
            fill="#233446"
            d="M612.888 188.778c18.716 0 33.894-15.172 33.894-33.889 0-18.716-15.178-33.889-33.894-33.889S579 136.173 579 154.889s15.172 33.889 33.888 33.889"
          />
          <path
            fill="#ffd000"
            d="M646.777 154.889c0 18.716-15.172 33.889-33.888 33.889a34 34 0 0 1-3.583-.188l24.36-60.477c7.981 6.2 13.111 15.889 13.111 26.776"
          />
        </svg>
      </span>
    );
  }

  if (isZibal) {
    return (
      <span
        className="icons__icon-zibal___wThzZ icons__icons___db6nw styles__icon___AXdaR relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card p-2 transition-colors"
        aria-label="لوگوی درگاه زیبال"
      >
        <svg viewBox="260 65 165 115" className="h-7 w-7" aria-hidden="true">
          <path
            d="M391.8,76.8l27.7,27.7c1.7,1.7,1.7,4.4,0,6L375,155.1c-1.7,1.7-4.4,1.7-6,0l-27.7-27.7 c-1.7-1.7-1.7-4.4,0-6l44.5-44.6C387.5,75.1,390.2,75.1,391.8,76.8z"
            fill="#2423D0"
          />
          <path
            d="M332.9,135.9l10.8,10.9c1.7,1.7,1.7,4.4,0,6L324.4,172c-1.7,1.7-4.4,1.7-6,0l-10.8-10.9 c-1.7-1.7-1.7-4.4,0-6l19.3-19.3C328.5,134.2,331.2,134.2,332.9,135.9z"
            fill="#2423D0"
          />
          <path
            d="M293.1,146.7L265.4,119c-1.7-1.7-1.7-4.4,0-6L310,68.3c1.7-1.7,4.4-1.7,6,0l27.7,27.7c1.7,1.7,1.7,4.4,0,6 l-44.5,44.6C297.5,148.4,294.8,148.4,293.1,146.7z"
            fill="#00D084"
          />
          <path
            d="M352.1,87.6l-10.8-10.9c-1.7-1.7-1.7-4.4,0-6l19.3-19.3c1.7-1.7,4.4-1.7,6,0l10.8,10.9c1.7,1.7,1.7,4.4,0,6 l-19.3,19.3C356.5,89.3,353.8,89.3,352.1,87.6z"
            fill="#2423D0"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="icons__icons___db6nw styles__icon___AXdaR relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card p-2 text-muted-foreground"
      aria-label="لوگوی درگاه پرداخت"
    >
      <CreditCard className="h-5 w-5" />
    </span>
  );
}

export function CheckoutFlow({
  loggedIn,
  initialRegions = [],
  initialGeneral = null,
}: {
  loggedIn: boolean;
  initialRegions?: RegionWithCities[];
  initialGeneral?: GeneralInfo | null;
}) {
  const router = useRouter();
  const { cart, isLoading: cartLoading, refresh } = useCart();
  const [step, setStep] = React.useState<Step>("address");
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [regions, setRegions] = React.useState<RegionWithCities[]>(() => {
    if (initialRegions && initialRegions.length > 0) return initialRegions;
    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem("monawear_regions_cache_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [general, setGeneral] = React.useState<GeneralInfo | null>(initialGeneral);
  const [saved, setSaved] = React.useState<ShippingAddress[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [ship, setShip] = React.useState<ApplicableShippingMethods | null>(null);
  const [rates, setRates] = React.useState<Record<string, number>>({});
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [payId, setPayId] = React.useState<number | null>(null);
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [coupon, setCoupon] = React.useState("");
  const [note, setNote] = React.useState("");
  const invoicePromiseRef = React.useRef<Promise<Invoice | null> | null>(null);

  React.useEffect(() => {
    if (initialRegions && initialRegions.length > 0 && regions.length === 0) {
      setRegions(initialRegions);
    }
  }, [initialRegions, regions.length]);

  React.useEffect(() => {
    if (initialGeneral && !general) {
      setGeneral(initialGeneral);
    }
  }, [initialGeneral, general]);

  React.useEffect(() => {
    try {
      const savedNote = window.localStorage.getItem("monawear_checkout_note_cache");
      if (savedNote) setNote(savedNote);
    } catch {}
  }, []);

  const handleNoteChange = (val: string) => {
    setNote(val);
    try {
      if (val) window.localStorage.setItem("monawear_checkout_note_cache", val);
      else window.localStorage.removeItem("monawear_checkout_note_cache");
    } catch {}
  };
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [initError, setInitError] = React.useState<ApiError | null>(null);
  const [payMessage, setPayMessage] = React.useState("");
  const started = React.useRef(false);

  const fail = (e: ApiError) => { setError(errorText(e)); return false; };

  // ---- bootstrap: invoice from the cart + supporting data in parallel ----
  React.useEffect(() => {
    if (cartLoading || started.current || !cart || cart.items.length === 0) return;
    started.current = true;

    // 1. Kick off invoices/create immediately
    invoicePromiseRef.current = sazitoFetch<Invoice>("invoices/create", { body: {} })
      .then((inv) => {
        if (inv.error) {
          setInitError(inv.error);
          return null;
        }
        setInvoice(inv.data);
        const hasValidAddress = Boolean(
          inv.data.shippingAddress &&
          inv.data.shippingAddress.identifier &&
          inv.data.shippingAddress.identifier.trim().length > 0 &&
          inv.data.shippingAddress.address &&
          inv.data.shippingAddress.address.trim().length > 0
        );
        if (hasValidAddress) {
          if (inv.data.needsShipping) {
            void loadShipping();
          } else {
            void loadPayment();
          }
        }
        return inv.data;
      })
      .catch((err) => {
        const netErr: ApiError = { type: "network", message: err instanceof Error ? err.message : "خطای شبکه" };
        setInitError(netErr);
        return null;
      });

    // 2. Fetch regions and general info concurrently if not already loaded
    const needsReg = regions.length === 0;
    const needsGen = !general;
    if (needsReg || needsGen) {
      Promise.all([
        needsReg ? sazitoFetch<RegionWithCities[]>("regions/list") : Promise.resolve(null),
        needsGen ? sazitoFetch<GeneralInfo>("general/info") : Promise.resolve(null),
      ]).then(([reg, gen]) => {
        if (reg?.data) {
          setRegions(reg.data);
          try {
            window.localStorage.setItem("monawear_regions_cache_v1", JSON.stringify(reg.data));
          } catch {}
        }
        if (gen?.data) {
          setGeneral(gen.data);
        }
      });
    }

    // 3. User data if logged in
    if (loggedIn) {
      Promise.all([
        sazitoFetch<ShippingAddress[]>("shipping/addresses/list"),
        sazitoFetch<User>("users/current"),
        sazitoFetch<Wallet>("wallet/balance"),
      ]).then(([addr, me, bal]) => {
        if (addr?.data) setSaved(addr.data);
        if (me?.data) setUser(me.data);
        if (bal?.data) setWallet(bal.data);
      });
    }
  }, [cart, cartLoading, loggedIn, regions.length, general]);

  const loadShipping = async () => {
    const r = await sazitoFetch<ApplicableShippingMethods>("invoices/applicable-shipping-methods");
    if (r.error) return fail(r.error);
    setShip(r.data);
    const chosen: Record<string, number> = {};
    for (const [k, list] of Object.entries(r.data.groupedShippingRates)) if (list[0]) chosen[k] = list[0].id;
    setRates(chosen);
    setStep("shipping");
    return true;
  };

  const attachAddress = async (addr: Pick<ShippingAddress, "id" | "identifier">) => {
    if (invoicePromiseRef.current) {
      const inv = await invoicePromiseRef.current;
      if (!inv) return;
    }
    const r = await sazitoFetch<Invoice>("invoices/add-shipping-address", { body: { shippingAddressId: addr.id, shippingAddressIdentifier: addr.identifier } });
    if (r.error) return fail(r.error);
    setInvoice(r.data);
    if (!r.data.needsShipping) return loadPayment();
    return loadShipping();
  };

  const submitAddress = async (v: AddressValues) => {
    setBusy(true); setError("");
    if (invoicePromiseRef.current) {
      const inv = await invoicePromiseRef.current;
      if (!inv) {
        setBusy(false);
        return;
      }
    }
    const a = await sazitoFetch<ShippingAddress>("shipping/addresses/create", { body: v });
    if (a.error) { setBusy(false); return fail(a.error); }
    await attachAddress(a.data);
    setBusy(false);
  };

  const groupItemIds = (key: string): Array<string | number> => {
    const ids = invoice?.items.map((i) => String(i.id)) ?? [];
    const parts = key.split(",");
    return parts.every((p) => ids.includes(p)) ? parts : ids;
  };

  const submitShipping = async () => {
    if (!ship) return;
    setBusy(true); setError("");
    const shippings = Object.entries(rates).map(([k, rateId]) => ({ rateId, invoiceItemIds: groupItemIds(k) }));
    const r = await sazitoFetch<Invoice>("invoices/assign-shipping-method", { body: { shippings } });
    if (r.error) { setBusy(false); return fail(r.error); }
    setInvoice(r.data);
    await loadPayment();
    setBusy(false);
  };

  const loadPayment = async () => {
    const m = await sazitoFetch<PaymentMethod[]>("payments/methods");
    if (m.error) return fail(m.error);
    const list = [...m.data].sort((a, b) => a.order - b.order);
    setMethods(list);
    setPayId((list.find((x) => x.isDefault) ?? list[0])?.id ?? null);
    setStep("payment");
    return true;
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setBusy(true); setError("");
    const r = await sazitoFetch<Invoice>("invoices/add-discount-code", { body: { code: coupon.trim() } });
    setBusy(false);
    if (r.error) return fail(r.error);
    setInvoice(r.data);
  };

  const removeCoupon = async () => {
    setBusy(true); setError("");
    const r = await sazitoFetch<Invoice>("invoices/remove-discount-code", { body: {} });
    setBusy(false);
    if (r.error) return fail(r.error);
    setInvoice(r.data);
    setCoupon("");
    void refresh();
  };

  const toggleCredit = async (on: boolean) => {
    setBusy(true); setError("");
    const r = await sazitoFetch<Invoice>(on ? "invoices/add-credit" : "invoices/remove-credit", { body: {} });
    setBusy(false);
    if (r.error) return fail(r.error);
    setInvoice(r.data);
  };

  // ---- payment ----
  const handleAction = async (a: PaymentAction): Promise<void> => {
    switch (a.action) {
      case "REDIRECT":
        window.location.assign(a.address);
        return;
      case "POST": {
        const f = document.createElement("form");
        f.method = "POST"; f.action = a.address;
        for (const [k, v] of Object.entries(a.payload)) { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = String(v); f.appendChild(i); }
        document.body.appendChild(f); f.submit();
        return;
      }
      case "show_order": {
        refresh();
        const q = new URLSearchParams({ status: "success" });
        if (a.order) { q.set("order", String(a.order.orderNumber)); q.set("id", String(a.order.id)); q.set("identifier", a.order.orderIdentifier); }
        router.push(`/checkout/result?${q}`);
        return;
      }
      case "pending": {
        const q = new URLSearchParams({ status: "pending", order: String(a.order.orderNumber), id: String(a.order.id), identifier: a.order.orderIdentifier });
        router.push(`/checkout/result?${q}`);
        return;
      }
      case "StockViolated":
        setError(a.message || "موجودی یکی از کالاها کافی نیست. سبد خرید را بررسی کنید.");
        return;
      case "show_otp_modal":
      case "UPLOAD":
        setPayMessage("این روش پرداخت به یک مرحله اضافی (کد تأیید یا بارگذاری رسید) نیاز دارد که هنوز در این نسخه پشتیبانی نمی‌شود. روش دیگری انتخاب کنید.");
        return;
      default:
        setError(("message" in a && a.message) || "پرداخت انجام نشد. دوباره تلاش کنید.");
    }
  };

  const pay = async () => {
    if (!payId) return;
    setBusy(true); setError(""); setPayMessage("");
    if (note.trim()) {
      const d = await sazitoFetch<Invoice>("invoices/add-details", { body: { comment: note.trim() } });
      if (d.error) { setBusy(false); return fail(d.error); }
    }
    const created = await sazitoFetch<Payment>("payments/create", { body: { paymentTypeId: payId } });
    if (created.error) { setBusy(false); return fail(created.error); }
    const init = await sazitoFetch<PaymentAction>("payments/initialize", { body: {} });
    if (init.error) { setBusy(false); return fail(init.error); }
    await handleAction(init.data);
    setBusy(false);
  };

  // ---- render ----
  if (cartLoading) return <Skeleton className="h-96 w-full" />;
  if (!cart || cart.items.length === 0)
    return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">سبد خرید شما خالی است.</p><Button asChild variant="outline"><Link href="/search">ادامه خرید</Link></Button></div>;
  if (initError)
    return <div className="mx-auto max-w-lg border bg-card p-8 text-center"><p className="mb-2 font-semibold">شروع فرایند سفارش ممکن نشد</p><p className="mb-6 text-sm text-muted-foreground">{errorText(initError)}</p><Button asChild variant="outline"><Link href="/cart">بازگشت به سبد خرید</Link></Button></div>;

  const idx = STEPS.findIndex((s) => s.id === step);
  const checkout = general?.settings?.checkout;
  const walletOn = !!general?.settings?.wallet?.enabled && loggedIn && !!wallet?.enabled && (wallet?.balance ?? 0) > 0;
  const creditApplied = (invoice?.creditTotal ?? 0) > 0;
  const appliedCouponCode =
    (invoice?.discountCode && invoice.discountCode.trim()) ||
    invoice?.discountUsages?.find((u) => Boolean(u.discountCode?.code?.trim()))?.discountCode?.code ||
    (invoice && (invoice.couponTotal ?? 0) > 0 ? (coupon.trim() ? coupon.trim().toUpperCase() : "کد تخفیف") : null);

  const hasAppliedCoupon = Boolean(
    invoice &&
      (((invoice.couponTotal ?? 0) > 0) || Boolean(appliedCouponCode))
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <ol className="checkout-steps mb-8 flex items-center gap-2 text-sm" aria-label="مراحل">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex min-w-0 items-center gap-2" aria-current={i === idx ? "step" : undefined}>
              <span className={cn("grid h-7 w-7 place-items-center rounded-full border text-xs", i < idx && "border-burgundy bg-burgundy text-white", i === idx && "border-foreground bg-foreground text-background")}>{i < idx ? <Check className="h-4 w-4" /> : formatNumber(i + 1)}</span>
              <span className={cn(i === idx ? "font-semibold" : "text-muted-foreground")}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
            </li>
          ))}
        </ol>
        {error && <div role="alert" className="mb-6 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

        {step === "address" ? (
          <section aria-label="اطلاعات ارسال">
            <header className="shipping-page-head">
              <Button asChild variant="outline" size="sm"><Link href="/cart">بازگشت</Link></Button>
              <h2>اطلاعات ارسال</h2>
              <span>مرحلهٔ ۱ از ۳</span>
            </header>
            {!loggedIn && <p className="mb-6 text-sm text-muted-foreground">خرید به‌صورت مهمان ممکن است. برای مشاهده سفارش‌ها <Link href="/account?next=/checkout" className="text-burgundy underline">وارد شوید</Link>.</p>}
            {saved.length > 0 && (
              <div className="mb-8 space-y-3">
                <h2 className="font-semibold">آدرس‌های ذخیره‌شده</h2>
                {saved.map((a) => (
                  <button key={a.id} disabled={busy} onClick={async () => { setBusy(true); setError(""); await attachAddress(a); setBusy(false); }} className="block w-full border bg-card p-4 text-start hover:border-foreground">
                    <p className="text-sm font-medium">{a.firstName} {a.lastName} — <span dir="ltr">{a.mobilePhone}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">{a.region?.name}، {a.city?.name}، {a.address}</p>
                  </button>
                ))}
                <h2 className="pt-4 font-semibold">یا آدرس جدید</h2>
              </div>
            )}
            <AddressForm
              regions={regions}
              emailOptional={checkout?.emailOptional ?? true}
              defaults={{ firstName: user?.firstName, lastName: user?.lastName, mobilePhone: user?.mobilePhone, email: user?.email }}
              busy={busy}
              onSubmit={submitAddress}
            />
          </section>
        ) : !invoice ? (
          <Skeleton className="h-72 w-full" />
        ) : step === "shipping" ? (
          <section aria-label="روش ارسال" className="space-y-6">
            <header className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("address")}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg -ms-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>بازگشت</span>
                </Button>
                <div className="h-4 w-px bg-border/60" />
                <h2 className="text-lg font-semibold text-foreground">روش ارسال</h2>
              </div>
              <span className="text-xs text-muted-foreground font-tabular-nums">مرحله ۲ از ۳</span>
            </header>

            {ship && Object.entries(ship.groupedShippingRates).length === 0 && (
              <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card">
                <Truck className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">روش ارسالی برای این آدرس یافت نشد</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">لطفاً نشانی کامل و استان و شهر را بررسی کنید.</p>
                <Button variant="outline" size="sm" onClick={() => setStep("address")}>
                  ویرایش آدرس ارسال
                </Button>
              </div>
            )}

            {ship &&
              Object.entries(ship.groupedShippingRates).map(([key, list]) => (
                <fieldset key={key} className="space-y-3">
                  <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    شیوه‌های تحویل سفارش
                  </legend>
                  <div className="grid gap-3">
                    {list.map((r) => {
                      const isSelected = rates[key] === r.id;
                      return (
                        <label
                          key={r.id}
                          className={cn(
                            "group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors duration-150 select-none",
                            isSelected
                              ? "border-burgundy bg-burgundy/[0.02]"
                              : "border-border/70 bg-card hover:border-border hover:bg-muted/15"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative flex items-center justify-center shrink-0">
                              <input
                                type="radio"
                                name={`g-${key}`}
                                checked={isSelected}
                                onChange={() => setRates({ ...rates, [key]: r.id })}
                                className="sr-only"
                              />
                              <div
                                className={cn(
                                  "grid h-5 w-5 place-items-center rounded-full border transition-colors duration-150",
                                  isSelected
                                    ? "border-burgundy bg-burgundy text-white"
                                    : "border-border bg-background group-hover:border-foreground/40"
                                )}
                              >
                                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="block text-sm font-semibold text-foreground">
                                  {r.name}
                                </span>
                              </div>
                              <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {r.description || "تحویل به شرکت حمل و نقل همراه با کد پیگیری مرسوله"}
                              </span>
                            </div>
                          </div>

                          <div className="text-end shrink-0">
                            {r.price ? (
                              <strong className="block text-sm font-semibold text-foreground font-tabular-nums">
                                {formatPrice(r.price)}
                              </strong>
                            ) : (r.name && (r.name.includes("رایگان") || r.description?.includes("رایگان"))) ? (
                              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                رایگان
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                                پس کرایه
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
              <PackageCheck className="h-4.5 w-4.5 text-burgundy shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-0.5">
                <strong className="font-medium text-foreground block">
                  ارسال با بسته‌بندی ۱۰۰٪ محرمانه
                </strong>
                <p>
                  تمام مرسوله‌ها در کارتن‌های پستی مقاوم و کاملاً مات ارسال می‌شوند. روی بسته هیچ نام، نشان تجاری یا اشاره‌ای به نوع کالا درج نمی‌شود.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setStep("address")}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-10 px-3"
              >
                <ArrowRight className="h-4 w-4" />
                بازگشت به اطلاعات ارسال
              </Button>
              <Button
                size="lg"
                variant="burgundy"
                className="h-11 px-7 rounded-xl font-medium text-sm shadow-xs transition-colors"
                disabled={busy || !ship || Object.keys(rates).length === 0}
                onClick={submitShipping}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ثبت…
                  </>
                ) : (
                  <>
                    ادامه به پرداخت
                    <ArrowLeft className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        ) : (
          <section aria-label="پرداخت" className="space-y-6">
            <header className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(invoice.needsShipping ? "shipping" : "address")}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg -ms-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>بازگشت</span>
                </Button>
                <div className="h-4 w-px bg-border/60" />
                <h2 className="text-lg font-semibold text-foreground">انتخاب درگاه پرداخت</h2>
              </div>
              <span className="text-xs text-muted-foreground font-tabular-nums">مرحله ۳ از ۳</span>
            </header>

            <fieldset className="space-y-3">
              <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                درگاه‌های پرداخت اینترنتی شاپرک
              </legend>
              {methods.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground bg-card">
                  درگاه پرداختی در حال حاضر فعال نیست.
                </div>
              )}
              <div className="grid gap-3">
                {methods.map((m) => {
                  const isSelected = payId === m.id;
                  return (
                    <label
                      key={m.id}
                      className={cn(
                        "group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors duration-150 select-none",
                        isSelected
                          ? "border-burgundy bg-burgundy/[0.02]"
                          : "border-border/70 bg-card hover:border-border hover:bg-muted/15"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="radio"
                            name="pay"
                            checked={isSelected}
                            onChange={() => setPayId(m.id)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded-full border transition-colors duration-150",
                              isSelected
                                ? "border-burgundy bg-burgundy text-white"
                                : "border-border bg-background group-hover:border-foreground/40"
                            )}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        <PaymentGatewayIcon method={m} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="block text-sm font-semibold text-foreground">
                              {formatPaymentTitle(m)}
                            </span>
                            {m.isDefault && (
                              <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                                درگاه پیشنهادی
                              </span>
                            )}
                          </div>
                          <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {m.description || "پرداخت اینترنتی امن با تمامی کارت‌های عضو شتاب"}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {walletOn && (
              <label
                className={cn(
                  "group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors duration-150 select-none",
                  creditApplied
                    ? "border-burgundy bg-burgundy/[0.02]"
                    : "border-border/70 bg-card hover:border-border hover:bg-muted/15"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-burgundy">
                    <WalletIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      استفاده از موجودی کیف پول
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 font-tabular-nums">
                      موجودی قابل استفاده: {formatPrice(wallet?.balance)}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={creditApplied}
                  disabled={busy}
                  onChange={(e) => toggleCredit(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-border accent-burgundy cursor-pointer"
                />
              </label>
            )}

            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="note" className="text-sm font-medium text-foreground">
                  توضیحات سفارش (اختیاری)
                </label>
                <span className="text-xs text-muted-foreground font-tabular-nums">
                  {formatNumber(note.length)} / {formatNumber(1000)}
                </span>
              </div>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                maxLength={1000}
                placeholder="اگر نکته‌ای درباره زمان ارسال یا تحویل دارید بنویسید…"
                className="min-h-[80px] rounded-lg border-border/70 text-sm focus-visible:ring-burgundy/25 focus-visible:border-burgundy"
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-0.5">
                <strong className="font-medium text-foreground block">
                  پرداخت مستقیم شاپرک (بانک مرکزی)
                </strong>
                <p>
                  کلیه تراکنش‌ها در بستر امن شبکه شاپرک و با رمزنگاری استاندارد SSL ۲۵۶ بیتی انجام می‌شوند.
                </p>
              </div>
            </div>

            {payMessage && (
              <p role="alert" className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
                {payMessage}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setStep(invoice.needsShipping ? "shipping" : "address")}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-10 px-3"
              >
                <ArrowRight className="h-4 w-4" />
                بازگشت به شیوه ارسال
              </Button>
              <Button
                size="lg"
                variant="burgundy"
                disabled={busy || !payId}
                onClick={pay}
                className="h-11 px-7 rounded-xl font-medium text-sm shadow-xs transition-colors"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال انتقال به درگاه…
                  </>
                ) : (
                  <>
                    پرداخت و ثبت نهایی
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Summary */}
      <aside className="checkout-order-summary h-fit lg:sticky lg:top-40" aria-label="خلاصه سفارش">
        <header className="checkout-summary-heading"><div><h2>خلاصه سفارش</h2><p>{formatNumber((invoice?.items ?? cart.items).reduce((total, item) => total + item.quantity, 0))} کالا در سبد خرید</p></div><Link href="/cart">ویرایش سبد</Link></header>
        <ul className="checkout-summary-products">
          {(invoice?.items ?? cart.items.map((c) => ({ id: c.id, name: c.product.name, image: c.product.image, attributes: c.product.attributes, quantity: c.quantity, lineTotal: c.lineTotal }))).map((it) => (
            <li key={it.id} className="checkout-summary-product">
              <div className="checkout-summary-image"><ProductImage src={it.image?.url} alt={it.name} sizes="64px" /></div>
              <div className="checkout-summary-product-copy"><h3>{it.name}</h3>
                <p className="checkout-summary-options">{it.attributes.filter((attribute) => attribute.attributeType === "differentiator").map((attribute) => `${attribute.name}: ${attrValue(attribute)}`).join(" · ")}</p>
                <div className="checkout-summary-product-price"><span>تعداد: {formatNumber(it.quantity)}</span><strong>{formatPrice(it.lineTotal)}</strong></div>
              </div>
            </li>
          ))}
        </ul>
        {invoice ? (
          <dl className="checkout-summary-totals">
            <div className="flex justify-between"><dt>جمع کالاها</dt><dd>{formatPrice(invoice.netTotal)}</dd></div>
            {invoice.discountTotal > 0 && <div className="flex justify-between text-burgundy"><dt>تخفیف</dt><dd>-{formatPrice(invoice.discountTotal)}</dd></div>}
            {invoice.couponTotal > 0 && <div className="flex justify-between text-burgundy"><dt>کد تخفیف</dt><dd>-{formatPrice(invoice.couponTotal)}</dd></div>}
            {invoice.shippingTotal > 0 ? (
              <div className="flex justify-between"><dt>ارسال</dt><dd>{formatPrice(invoice.shippingTotal)}</dd></div>
            ) : (step === "shipping" || step === "payment") ? (
              <div className="flex justify-between"><dt>ارسال</dt><dd className="text-xs text-muted-foreground font-medium">پس کرایه</dd></div>
            ) : null}
            {invoice.vat > 0 && <div className="flex justify-between"><dt>مالیات</dt><dd>{formatPrice(invoice.vat)}</dd></div>}
            {invoice.creditTotal > 0 && <div className="flex justify-between text-burgundy"><dt>اعتبار کیف پول</dt><dd>-{formatPrice(invoice.creditTotal)}</dd></div>}
            <div className="checkout-summary-payable"><dt>مبلغ قابل پرداخت</dt><dd>{formatPrice(invoice.finalTotal)}</dd></div>
          </dl>
        ) : (
          <dl className="checkout-summary-totals">
            <div className="flex justify-between"><dt>جمع کالاها</dt><dd>{formatPrice(cart.netTotal)}</dd></div>
            <div className="checkout-summary-payable"><dt>مبلغ قابل پرداخت</dt><dd>{formatPrice(cart.grossTotal ?? cart.netTotal)}</dd></div>
          </dl>
        )}
        {invoice && (
          hasAppliedCoupon ? (
            <div className="checkout-summary-coupon-applied">
              <div className="coupon-info">
                <Tag className="h-4 w-4 text-burgundy shrink-0" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="coupon-badge">{appliedCouponCode}</span>
                    <span className="coupon-status">اعمال شد</span>
                  </div>
                  {invoice.couponTotal > 0 && (
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      تخفیف: {formatPrice(invoice.couponTotal)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                disabled={busy}
                className="coupon-remove-btn"
                aria-label="حذف کد تخفیف"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>حذف</span>
              </Button>
            </div>
          ) : (
            <form className="checkout-summary-coupon" onSubmit={(event) => { event.preventDefault(); if (!busy) void applyCoupon(); }}>
              <label htmlFor="checkout-coupon">کد تخفیف دارید؟</label>
              <div>
                <Input id="checkout-coupon" placeholder="کد را وارد کنید" value={coupon} onChange={(e) => setCoupon(e.target.value)} dir="ltr" className="text-end" autoCapitalize="none" autoComplete="off" disabled={busy} />
                <Button type="submit" variant="outline" disabled={busy || !coupon.trim()}>اعمال کد</Button>
              </div>
            </form>
          )
        )}
        {step === "address" && (
          <Button
            type="submit"
            form="checkout-address-form"
            size="lg"
            variant="burgundy"
            className="shipping-summary-continue"
            disabled={busy || !regions.length}
          >
            {busy ? "در حال ثبت…" : "ثبت اطلاعات ارسال"}
          </Button>
        )}
        {invoice && step === "shipping" && (
          <Button
            type="button"
            size="lg"
            variant="burgundy"
            className="shipping-summary-continue"
            disabled={busy || !ship || Object.keys(rates).length === 0}
            onClick={submitShipping}
          >
            {busy ? "در حال ثبت…" : "ادامه به پرداخت"}
          </Button>
        )}
        {invoice && step === "payment" && (
          <Button
            type="button"
            size="lg"
            variant="burgundy"
            className="shipping-summary-continue"
            disabled={busy || !payId}
            onClick={pay}
          >
            {busy ? "در حال انتقال…" : "پرداخت و ثبت نهایی"}
          </Button>
        )}
      </aside>
      {(invoice || step === "address") && (
        <div className="shipping-mobile-continue">
          <div className="shipping-mobile-price">
            <span className="shipping-mobile-label">مبلغ قابل پرداخت</span>
            <strong className="shipping-mobile-amount">{formatPrice(invoice?.finalTotal ?? (cart.grossTotal ?? cart.netTotal))}</strong>
          </div>
          {step === "address" ? (
            <Button
              type="submit"
              form="checkout-address-form"
              size="lg"
              variant="burgundy"
              className="shipping-mobile-btn rounded-xl font-medium text-sm h-11 px-6 shadow-xs transition-colors"
              disabled={busy || !regions.length}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ثبت…
                </>
              ) : (
                "ثبت اطلاعات ارسال"
              )}
            </Button>
          ) : step === "shipping" ? (
            <Button
              type="button"
              onClick={submitShipping}
              size="lg"
              variant="burgundy"
              className="shipping-mobile-btn rounded-xl font-medium text-sm h-11 px-6 shadow-xs transition-colors"
              disabled={busy || !ship || Object.keys(rates).length === 0}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ثبت…
                </>
              ) : (
                "ادامه به پرداخت"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={pay}
              size="lg"
              variant="burgundy"
              className="shipping-mobile-btn rounded-xl font-medium text-sm h-11 px-6 shadow-xs transition-colors"
              disabled={busy || !payId}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال انتقال…
                </>
              ) : (
                "پرداخت و ثبت نهایی"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
