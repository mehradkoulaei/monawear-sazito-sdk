import Link from "next/link";
import { AlertCircle, PackageSearch } from "lucide-react";
import type { SazitoError } from "@sazito/client-sdk";

export function ErrorState({
  error,
  title = "دریافت اطلاعات ممکن نشد",
}: {
  error?: SazitoError;
  title?: string;
}) {
  const notConfigured = error?.status === 503;
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border/70 bg-card/60 p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
          <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          {notConfigured ? "اتصال فروشگاه هنوز تنظیم نشده است" : title}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {notConfigured
            ? "فروشگاه موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید."
            : "لطفاً چند لحظه بعد دوباره تلاش کنید."}
        </p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  text,
  href = "/search",
  cta = "مشاهده همه محصولات",
}: {
  title: string;
  text?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-muted-foreground">
        <PackageSearch className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="mb-1.5 text-base font-semibold text-foreground">{title}</h2>
      {text && <p className="mb-6 text-xs text-muted-foreground">{text}</p>}
      <Link
        href={href}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-border/80 bg-card px-4 text-xs font-medium text-foreground/90 transition-all duration-150 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-burgundy active:scale-[0.99]"
      >
        {cta}
      </Link>
    </div>
  );
}
