"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart/cart-provider";
import { errorText, sazitoFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Mode = "otp" | "password" | "register" | "forgot" | "reset";

export function AuthForms({ registerEnabled = true }: { registerEnabled?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { cart, refresh } = useCart();
  const [mode, setMode] = React.useState<Mode>(sp.get("token") ? "reset" : "otp");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [f, setF] = React.useState({ email: "", password: "", password2: "", firstName: "", lastName: "", mobile: "", otp: "" });
  const [otpSent, setOtpSent] = React.useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const done = async () => {
    // Merge a guest cart into the account (SDK behaviour unverified; failures are ignored on purpose).
    if (cart && cart.items.length) await sazitoFetch("users/merge", { body: {} });
    refresh();
    const next = sp.get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
    router.refresh();
  };
  const run = async (fn: () => Promise<{ error?: Parameters<typeof errorText>[0] }>, ok?: () => void | Promise<void>) => {
    setBusy(true); setMsg(null);
    const r = await fn();
    setBusy(false);
    if (r.error) return setMsg({ kind: "err", text: errorText(r.error) });
    await ok?.();
  };

  const Tab = ({ m, children }: { m: Mode; children: React.ReactNode }) => (
    <button type="button" onClick={() => { setMode(m); setMsg(null); }} aria-pressed={mode === m} className={cn("flex-1 border-b-2 py-3 text-sm", mode === m ? "border-foreground font-semibold" : "border-transparent text-muted-foreground")}>{children}</button>
  );

  return (
    <div className="auth-panel mx-auto max-w-md">
      <div className="mb-6 flex" aria-label="روش ورود">
        <Tab m="otp">ورود با موبایل</Tab><Tab m="password">ورود با رمز</Tab>{registerEnabled && <Tab m="register">ثبت‌نام</Tab>}
      </div>
      {msg && <p role="alert" className={cn("mb-4 p-3 text-sm", msg.kind === "err" ? "border border-destructive/40 bg-destructive/5 text-destructive" : "border border-emerald-300 bg-emerald-50 text-emerald-900")}>{msg.text}</p>}

      {mode === "otp" && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!otpSent) run(() => sazitoFetch("users/otp/request", { body: { mobilePhone: f.mobile } }), () => { setOtpSent(true); setMsg({ kind: "ok", text: "کد تأیید ارسال شد." }); }); else run(() => sazitoFetch("users/otp/verify", { body: { mobilePhone: f.mobile, token: f.otp } }), done); }}>
          <div><Label htmlFor="mobile">شماره موبایل</Label><Input id="mobile" autoComplete="tel" inputMode="tel" dir="ltr" className="text-end" value={f.mobile} onChange={set("mobile")} placeholder="09123456789" required disabled={otpSent} /></div>
          {otpSent && <div><Label htmlFor="otp">کد تأیید</Label><Input id="otp" autoComplete="one-time-code" inputMode="numeric" dir="ltr" className="text-end" value={f.otp} onChange={set("otp")} required autoFocus /></div>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{otpSent ? "ورود" : "دریافت کد تأیید"}</Button>
          {otpSent && <button type="button" className="text-xs text-burgundy underline" onClick={() => { setOtpSent(false); setF({ ...f, otp: "" }); }}>تغییر شماره</button>}
          <p className="text-xs text-muted-foreground">کد تأیید به شماره موبایل شما ارسال می‌شود.</p>
        </form>
      )}
      {mode === "password" && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(() => sazitoFetch("users/login", { body: { email: f.email, password: f.password } }), done); }}>
          <div><Label htmlFor="email">ایمیل</Label><Input id="email" type="email" dir="ltr" className="text-end" value={f.email} onChange={set("email")} required autoComplete="email" /></div>
          <div><Label htmlFor="pw">رمز عبور</Label><Input id="pw" type="password" dir="ltr" className="text-end" value={f.password} onChange={set("password")} required autoComplete="current-password" /></div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>ورود</Button>
          <div className="flex justify-between text-xs"><button type="button" className="text-burgundy underline" onClick={() => setMode("forgot")}>فراموشی رمز عبور</button>
            <button type="button" className="text-burgundy underline" onClick={() => run(() => sazitoFetch("users/email-login/request", { body: { email: f.email } }), () => setMsg({ kind: "ok", text: "اگر ایمیل ثبت شده باشد، لینک ورود ارسال می‌شود." }))}>ورود بدون رمز با ایمیل</button></div>
        </form>
      )}
      {mode === "register" && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(() => sazitoFetch("users/register", { body: { email: f.email, password: f.password, passwordConfirmation: f.password2, firstName: f.firstName || undefined, lastName: f.lastName || undefined, mobilePhone: f.mobile || undefined } }), () => { setMode("password"); setMsg({ kind: "ok", text: "ثبت‌نام انجام شد. اکنون وارد شوید." }); }); }}>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="fn">نام</Label><Input id="fn" value={f.firstName} onChange={set("firstName")} /></div><div><Label htmlFor="ln">نام خانوادگی</Label><Input id="ln" value={f.lastName} onChange={set("lastName")} /></div></div>
          <div><Label htmlFor="remail">ایمیل</Label><Input id="remail" type="email" dir="ltr" className="text-end" value={f.email} onChange={set("email")} required /></div>
          <div><Label htmlFor="rmobile">موبایل (اختیاری)</Label><Input id="rmobile" inputMode="tel" dir="ltr" className="text-end" value={f.mobile} onChange={set("mobile")} /></div>
          <div><Label htmlFor="rpw">رمز عبور (حداقل ۶ کاراکتر)</Label><Input id="rpw" type="password" dir="ltr" className="text-end" value={f.password} onChange={set("password")} required minLength={6} autoComplete="new-password" /></div>
          <div><Label htmlFor="rpw2">تکرار رمز عبور</Label><Input id="rpw2" type="password" dir="ltr" className="text-end" value={f.password2} onChange={set("password2")} required minLength={6} autoComplete="new-password" /></div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>ثبت‌نام</Button>
        </form>
      )}
      {mode === "forgot" && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(() => sazitoFetch("users/password/forgot", { body: { email: f.email } }), () => setMsg({ kind: "ok", text: "اگر ایمیل ثبت شده باشد، لینک بازیابی ارسال می‌شود." })); }}>
          <div><Label htmlFor="femail">ایمیل</Label><Input id="femail" type="email" dir="ltr" className="text-end" value={f.email} onChange={set("email")} required /></div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>ارسال لینک بازیابی</Button>
          <button type="button" className="text-xs text-burgundy underline" onClick={() => setMode("password")}>بازگشت به ورود</button>
        </form>
      )}
      {mode === "reset" && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(() => sazitoFetch("users/password/revive", { body: { forgotPasswordToken: sp.get("token") ?? "", password: f.password, passwordConfirmation: f.password2 } }), done); }}>
          <div><Label htmlFor="npw">رمز عبور جدید</Label><Input id="npw" type="password" dir="ltr" className="text-end" value={f.password} onChange={set("password")} required minLength={6} /></div>
          <div><Label htmlFor="npw2">تکرار رمز عبور</Label><Input id="npw2" type="password" dir="ltr" className="text-end" value={f.password2} onChange={set("password2")} required minLength={6} /></div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>تغییر رمز و ورود</Button>
        </form>
      )}
    </div>
  );
}
