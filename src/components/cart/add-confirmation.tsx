"use client";
import * as React from "react";
import Link from "next/link";
import type { CartProduct } from "@sazito/client-sdk";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/products/product-image";
import { attrValue } from "@/lib/product";
import { formatNumber, toPath } from "@/lib/utils";

export function AddConfirmation({ item, quantity, onClose }: { item: CartProduct; quantity: number; onClose: () => void }) {
  const [seconds, setSeconds] = React.useState(5);
  const [hovered, setHovered] = React.useState(false);
  const [keyboardInteraction, setKeyboardInteraction] = React.useState(false);
  const paused = hovered || keyboardInteraction;
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  React.useEffect(() => {
    if (paused || hidden) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [paused, hidden]);
  React.useEffect(() => { if (seconds === 0) onClose(); }, [seconds, onClose]);
  const attributes = item.product.attributes.filter((attribute) => attribute.attributeType === "differentiator");

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent title="به سبد خریدت اضافه شد" hideTitle aria-label="محصول به سبد خرید اضافه شد" className="add-confirmation"
      onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onKeyDown={() => setKeyboardInteraction(true)}>
      <div className="add-confirmation-heading"><span className="add-confirmation-check" aria-hidden="true"><Check size={20} /></span><p className="add-confirmation-title">به سبد خریدت اضافه شد</p></div>
      <div className="add-confirmation-product">
        <Link href={toPath(item.product.url)} onClick={onClose} className="add-confirmation-image" tabIndex={-1} aria-hidden="true"><ProductImage src={item.product.image?.url} alt={item.product.name} sizes="96px" /></Link>
        <div><h3><Link href={toPath(item.product.url)} onClick={onClose}>{item.product.name}</Link></h3>
          {attributes.map((attribute, i) => <p key={`${attribute.name}-${i}`}>{attribute.name}: {attrValue(attribute)}</p>)}
          <p>تعداد افزوده‌شده: <strong>{formatNumber(quantity)}</strong></p>
        </div>
      </div>
      <p className="add-confirmation-note">می‌توانی به دیدن مدل‌ها ادامه بدهی؛ انتخابت در سبد خرید محفوظ است.</p>
      <div className="add-confirmation-actions">
        <Button type="button" variant="burgundy" onClick={onClose} autoFocus>ادامهٔ خرید{!paused && <span aria-hidden="true">({formatNumber(seconds)} ثانیه)</span>}<ArrowLeft size={17} aria-hidden="true" /></Button>
        <Button asChild variant="outline"><Link href="/cart" onClick={onClose}><ShoppingBag size={17} aria-hidden="true" />مشاهدهٔ سبد خرید</Link></Button>
      </div>
    </DialogContent>
  </Dialog>;
}
