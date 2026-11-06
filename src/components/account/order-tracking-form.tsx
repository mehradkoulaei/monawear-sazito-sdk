"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderTrackingForm({ defaultId, defaultIdentifier }: { defaultId?: string; defaultIdentifier?: string }) {
  const router = useRouter();
  const [id, setId] = React.useState(defaultId ?? "");
  const [identifier, setIdentifier] = React.useState(defaultIdentifier ?? "");
  const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(`/order-tracking?id=${encodeURIComponent(toEn(id.trim()))}&identifier=${encodeURIComponent(identifier.trim())}`); }} className="grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="oid">شناسه سفارش</Label><Input id="oid" value={id} onChange={(e) => setId(e.target.value)} required dir="ltr" className="text-end" /></div>
      <div><Label htmlFor="oidf">کد پیگیری</Label><Input id="oidf" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required dir="ltr" className="text-end" /></div>
      <div className="sm:col-span-2"><Button type="submit" size="lg">پیگیری</Button></div>
    </form>
  );
}
