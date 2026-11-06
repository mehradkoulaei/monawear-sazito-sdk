import { Star } from "lucide-react";
import { getProductReviews, getProductStatistics } from "@/lib/sazito/services";
import { formatDate, formatNumber } from "@/lib/utils";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`امتیاز ${formatNumber(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={n <= Math.round(value) ? "h-4 w-4 fill-burgundy text-burgundy" : "h-4 w-4 text-muted-foreground/40"} />)}
    </span>
  );
}

/** Real reviews only (Sazito "Tajrobe"). Rendered by the caller only when the store enabled the feature. */
export async function Reviews({ productId }: { productId: number }) {
  const [stats, list] = await Promise.all([getProductStatistics(productId), getProductReviews(productId)]);
  const s = stats.data?.productStatistics;
  const reviews = list.data?.entities ?? [];
  if (!s || s.totalCount === 0) return null;
  return (
    <section className="container py-12" aria-label="نظرات کاربران">
      <h2 className="mb-6 text-xl font-bold">نظرات کاربران</h2>
      <div className="mb-8 flex items-center gap-4">
        <span className="text-4xl font-bold">{formatNumber(Number(s.averageRate.toFixed(1)))}</span>
        <div><Stars value={s.averageRate} /><p className="text-xs text-muted-foreground">از {formatNumber(s.totalCount)} نظر</p></div>
      </div>
      <ul className="divide-y">
        {reviews.map((r, i) => (
          <li key={i} className="py-5">
            <div className="flex items-center gap-3"><Stars value={r.productRate} /><span className="text-sm font-medium">{r.isAnonymous ? "کاربر" : `${r.userFirstName} ${r.userLastName}`.trim()}</span><span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span></div>
            {r.text && <p className="mt-2 text-sm leading-7">{r.text}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
