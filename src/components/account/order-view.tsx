import Image from "next/image";
import type { Order } from "@sazito/client-sdk";
import { attrValue } from "@/lib/product";
import { formatPrice } from "@/lib/utils";

export function OrderView({ order }: { order: Order }) {
  const inv = order.invoice;
  return (
    <div className="space-y-6">
      <div className="border bg-card p-5">
        <p className="text-sm text-muted-foreground">شماره سفارش</p>
        <p className="text-xl font-bold">{order.orderNumber}</p>
      </div>
      <ul className="divide-y border bg-card">
        {inv.invoiceItems.map((i, k) => (
          <li key={k} className="flex gap-4 p-4">
            <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden bg-muted">{i.image?.url && <Image src={i.image.url} alt={i.name} fill sizes="72px" className="object-cover" />}</div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{i.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{i.attributes.filter((a) => a.attributeType === "differentiator").map((a) => `${a.name}: ${attrValue(a)}`).join("، ")}</p>
              <p className="mt-2 text-xs">تعداد: {i.quantity}</p>
            </div>
            <div className="text-sm font-semibold">{formatPrice(i.lineTotal)}</div>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border bg-card p-5 text-sm">
        {inv.netTotal !== undefined && <div className="flex justify-between"><dt>جمع کالاها</dt><dd>{formatPrice(inv.netTotal)}</dd></div>}
        {!!inv.discountTotal && <div className="flex justify-between"><dt>تخفیف</dt><dd>-{formatPrice(inv.discountTotal)}</dd></div>}
        {!!inv.shippingTotal && <div className="flex justify-between"><dt>ارسال</dt><dd>{formatPrice(inv.shippingTotal)}</dd></div>}
        {!!inv.creditTotal && <div className="flex justify-between"><dt>اعتبار کیف پول</dt><dd>-{formatPrice(inv.creditTotal)}</dd></div>}
        {inv.finalTotal !== undefined && <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>مبلغ نهایی</dt><dd>{formatPrice(inv.finalTotal)}</dd></div>}
      </dl>
    </div>
  );
}
