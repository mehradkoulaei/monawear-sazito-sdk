import React from "react";
import Image from "next/image";
import { ShieldCheck, ExternalLink } from "lucide-react";

export interface TrustItem {
  id: string;
  name: string;
  subtitle: string;
  href: string;
  title: string;
  ariaLabel: string;
  imageSrc: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: "enamad",
    name: "نماد اعتماد الکترونیکی",
    subtitle: "تأییدیه رسمی اینماد",
    href: "https://trustseal.enamad.ir/?id=691725&Code=ZaaDy9owIIHG6ay1iEYL469vTN3vgx8B",
    title: "مشاهده نماد اعتماد الکترونیکی فروشگاه",
    ariaLabel: "مشاهده نماد اعتماد الکترونیکی فروشگاه",
    imageSrc: "/images/trust/enamad.webp",
  },
  {
    id: "zibal",
    name: "درگاه پرداخت زیبال",
    subtitle: "تأییدیه درگاه امن",
    href: "https://gateway.zibal.ir/trustMe/monawear.ir",
    title: "مشاهده تاییدیه درگاه پرداخت زیبال",
    ariaLabel: "مشاهده تاییدیه درگاه پرداخت زیبال",
    imageSrc: "/images/trust/zibal.webp",
  },
  {
    id: "zarinpal",
    name: "درگاه پرداخت زرین‌پال",
    subtitle: "پرداخت سریع و مطمئن",
    href: "https://www.zarinpal.com/trustPage/monawear.ir",
    title: "مشاهده تاییدیه درگاه پرداخت زرین پال",
    ariaLabel: "مشاهده تاییدیه درگاه پرداخت زرین پال",
    imageSrc: "/images/trust/zarinpal.webp",
    referrerPolicy: "origin",
  },
  {
    id: "emalls",
    name: "فروشگاه در ایمالز",
    subtitle: "مرجع قیمت و خرید",
    href: "https://emalls.ir/Shop/75262/",
    title: "مشاهده فروشگاه در ایمالز",
    ariaLabel: "مشاهده فروشگاه در ایمالز",
    imageSrc: "/images/trust/emalls.webp",
  },
  {
    id: "zarehbin",
    name: "فروشگاه در ذره‌بین",
    subtitle: "جستجو و مقایسه",
    href: "https://www.zarehbin.com/store-details/%d9%be%d9%88%d8%b4%d8%a7%da%a9-%d9%85%d9%88%d9%86%d8%a7/134387",
    title: "مشاهده فروشگاه در ذرهبین",
    ariaLabel: "مشاهده فروشگاه در ذرهبین",
    imageSrc: "/images/trust/zarehbin.webp",
  },
  {
    id: "torob",
    name: "محصولات در ترب",
    subtitle: "فروشگاه معتبر ترب",
    href: "https://torob.com/shop/339356/%D9%BE%D9%88%D8%B4%D8%A7%DA%A9-%D9%85%D9%88%D9%86%D8%A7/%D9%85%D8%AD%D8%B5%D9%88%D9%84%D8%A7%D8%AA/",
    title: "مشاهده محصولات در ترب",
    ariaLabel: "مشاهده محصولات در ترب",
    imageSrc: "/images/trust/torob.webp",
  },
];

export function FooterTrust() {
  return (
    <section
      className="footer-trust border-t border-border/70 py-10"
      aria-labelledby="footer-trust-title"
    >
      <div className="container">
        {/* Section Header */}
        <div className="mb-6 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-start">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="footer-trust-title"
                className="text-base font-bold text-foreground text-balance"
              >
                نمادها و حضور مونا
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                برای مشاهده صفحه فروشگاه در هر سرویس، روی نشان آن بزنید.
              </p>
            </div>
          </div>
          <span className="hidden text-xs text-muted-foreground/80 md:inline-block">
            دارای مجوز رسمی اینماد و درگاه‌های پرداخت امن شاپرک
          </span>
        </div>

        {/* Badges Grid (Responsive: 2 cols on mobile, 3 on tablet, 6 on desktop) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 lg:gap-4">
          {TRUST_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="external nofollow noopener noreferrer"
              referrerPolicy={item.referrerPolicy}
              title={item.title}
              aria-label={item.ariaLabel}
              className="group relative flex flex-col items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy active:scale-[0.98]"
            >
              {/* Outer image frame adhering to nested radius: outer rounded-xl (12px), inner rounded-lg (8px) */}
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white p-2 border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={item.imageSrc}
                  alt={item.name}
                  width={80}
                  height={80}
                  unoptimized
                  loading="eager"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Label & Subtitle */}
              <div className="mt-3 flex w-full flex-col items-center text-center">
                <span className="text-xs font-semibold text-foreground transition-colors group-hover:text-burgundy text-balance line-clamp-1">
                  {item.name}
                </span>
                <span className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {item.subtitle}
                </span>
              </div>

              {/* Subtle External Link Indicator */}
              <div className="absolute left-2.5 top-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ExternalLink className="h-3 w-3 text-burgundy" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
