"use client";
import * as React from "react";
import { Star } from "lucide-react";
import type { FeedbackSeed } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { errorText, sazitoFetch } from "@/lib/api/client";

function Rate({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}`} onClick={() => onChange(n)}><Star className={n <= value ? "h-6 w-6 fill-burgundy text-burgundy" : "h-6 w-6 text-muted-foreground/40"} /></button>)}
    </div>
  );
}

/** Order → product feedback via three separate requests: feedbacks/seed, order-rating, product-review. */
export function OrderFeedback({ orderIdentifier }: { orderIdentifier: string }) {
  const [seed, setSeed] = React.useState<FeedbackSeed | null>(null);
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");
  const [orderRate, setOrderRate] = React.useState(0);
  const [items, setItems] = React.useState<Record<string, { rate: number; text: string }>>({});
  const [err, setErr] = React.useState("");

  const load = async () => {
    setState("loading"); setErr("");
    const r = await sazitoFetch<FeedbackSeed>("feedbacks/seed", { query: { orderIdentifier } });
    if (r.error) { setErr(errorText(r.error)); setState("idle"); return; }
    setSeed(r.data); setState("idle");
  };

  const submit = async () => {
    if (!seed || !orderRate) return setErr("امتیاز سفارش را انتخاب کنید.");
    setState("loading"); setErr("");
    const rating = await sazitoFetch<{ id: string }>("feedbacks/order-rating", { body: { orderId: Number(seed.orderId), orderIdentifier, orderRate } });
    if (rating.error) { setErr(errorText(rating.error)); setState("idle"); return; }
    for (const it of seed.items) {
      const v = items[it.productId];
      if (!v?.rate) continue;
      const r = await sazitoFetch("feedbacks/product-review", { body: {
        commentId: rating.data.id, productId: Number(it.productId), productVariantId: Number(it.productVariantId), productRate: v.rate, text: v.text || undefined, productName: it.productName,
      } });
      if (r.error) { setErr(errorText(r.error)); setState("idle"); return; }
    }
    setState("done");
  };

  if (state === "done") return <p className="mt-10 border bg-card p-5 text-sm text-emerald-700">از ثبت نظر شما سپاسگزاریم.</p>;
  return (
    <section className="mt-10 border bg-card p-6" aria-label="ثبت نظر">
      <h2 className="mb-4 font-semibold">نظر شما درباره این سفارش</h2>
      {!seed ? (
        <Button variant="outline" onClick={load} disabled={state === "loading"}>ثبت نظر</Button>
      ) : seed.hasCommentAlready ? <p className="text-sm text-muted-foreground">برای این سفارش قبلاً نظر ثبت شده است.</p> : (
        <div className="space-y-6">
          <div><p className="mb-2 text-sm">امتیاز کلی سفارش</p><Rate value={orderRate} onChange={setOrderRate} label="امتیاز سفارش" /></div>
          {seed.items.map((it) => (
            <div key={it.productId} className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">{it.productName}</p>
              <Rate value={items[it.productId]?.rate ?? 0} onChange={(n) => setItems({ ...items, [it.productId]: { rate: n, text: items[it.productId]?.text ?? "" } })} label={`امتیاز ${it.productName}`} />
              <Textarea placeholder="نظر شما (اختیاری)" value={items[it.productId]?.text ?? ""} onChange={(e) => setItems({ ...items, [it.productId]: { rate: items[it.productId]?.rate ?? 0, text: e.target.value } })} />
            </div>
          ))}
          <Button onClick={submit} disabled={state === "loading"}>ارسال نظر</Button>
        </div>
      )}
      {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}
    </section>
  );
}
