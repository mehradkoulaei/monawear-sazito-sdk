import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState, ErrorState } from "@/components/state";
import { getMyWallet } from "@/lib/sazito/services";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "کیف پول", robots: { index: false } };

export default async function WalletPage() {
  const w = await getMyWallet();
  if (!w) redirect("/account?next=/account/wallet");
  if (w.balance.error) return <ErrorState error={w.balance.error} />;
  if (!w.balance.data.enabled) return <div className="container"><EmptyState title="کیف پول در این فروشگاه فعال نیست" href="/account" cta="بازگشت به حساب" /></div>;
  const tx = w.tx.data?.transactions ?? [];
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">کیف پول</h1>
      <div className="mb-8 border bg-card p-6"><p className="text-sm text-muted-foreground">موجودی</p><p className="text-3xl font-bold">{formatPrice(w.balance.data.balance)}</p></div>
      <h2 className="mb-3 font-semibold">تراکنش‌ها</h2>
      {tx.length === 0 ? <p className="text-sm text-muted-foreground">تراکنشی ثبت نشده است.</p> : (
        <ul className="divide-y border bg-card">{tx.map((t) => <li key={t.id} className="flex justify-between p-4 text-sm"><span>{formatDate(t.createdAt)}</span><span>{formatPrice(t.amount)}</span></li>)}</ul>
      )}
    </div>
  );
}
