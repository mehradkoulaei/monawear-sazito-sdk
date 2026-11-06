"use client";
import { useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowUpLeft, PackageSearch } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const carriers = { post: { name: "پست", url: "https://tracking.post.ir/?id=" }, tipax: { name: "تیپاکس", url: "https://tipaxco.com/tracking?id=" } };
export function TrackingDialog({ onClose, triggerRef }: { onClose: () => void; triggerRef: RefObject<HTMLButtonElement | null> }) {
  const [carrier, setCarrier] = useState<keyof typeof carriers>("post");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const prepare = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\s/g, "");
    if (!/^\d{10,30}$/.test(normalized)) {
      setError("کد رهگیری باید شامل ۱۰ تا ۳۰ رقم باشد. کد پیامک‌شده را بررسی کنید.");
      return;
    }
    setError("");
    window.open(carriers[carrier].url + encodeURIComponent(normalized), "_blank", "noopener,noreferrer");
  };
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent title="رهگیری مرسوله" className="mona-tracking-dialog" onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }}>
      <span className="mona-help-emblem"><PackageSearch size={24} aria-hidden="true" /></span>
      <p className="body-6 mona-help-muted">کد رهگیری پیامک‌شده را وارد کنید تا وضعیت بسته را در سامانهٔ شرکت ارسال ببینید.</p>
      <form onSubmit={prepare} className="mona-tracking-form" noValidate>
        <fieldset><legend className="title-4">شرکت ارسال</legend><div className="mona-carriers">{Object.entries(carriers).map(([key, value]) => <label key={key} className={carrier === key ? "is-selected" : undefined}>
          <input type="radio" name="tracking-carrier" value={key} checked={carrier === key} onChange={() => { setCarrier(key as keyof typeof carriers); setError(""); }} /><span className="title-4">{value.name}</span>
        </label>)}</div></fieldset>
        <div><label htmlFor="parcel-code" className="title-4">کد رهگیری مرسوله</label><Input id="parcel-code" dir="ltr" inputMode="numeric" autoComplete="off" maxLength={40} placeholder="کد پیامک‌شده" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "parcel-code-error" : "parcel-code-hint"} />
          {error ? <p id="parcel-code-error" role="alert" className="caption-5 mona-help-error">{error}</p> : <p id="parcel-code-hint" className="caption-5 mona-help-muted">اعداد فارسی و انگلیسی پذیرفته می‌شوند.</p>}</div>
        <Button type="submit" variant="burgundy">رهگیری در سایت {carriers[carrier].name}<ArrowUpLeft size={18} aria-hidden="true" /></Button>
        <p className="caption-5 mona-help-muted">سامانهٔ ارسال در زبانهٔ جدید باز می‌شود؛ ممکن است ورود کد تصویر لازم باشد.</p>
      </form>
      <div className="mona-tracking-order"><p className="caption-5 mona-help-muted">هنوز کد رهگیری مرسوله ندارید؟</p><Link href="/order-tracking" onClick={onClose} className="title-4">پیگیری سفارش در مونا ←</Link></div>
    </DialogContent>
  </Dialog>;
}
