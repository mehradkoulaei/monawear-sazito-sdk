import Link from "next/link";
import Image from "next/image";
import { Brand } from "./brand";
import { AtSign, Phone, Send } from "lucide-react";
import { getCmsPages, getGeneral } from "@/lib/sazito/services";
import { siteConfig } from "@/config/site";
import { toPath } from "@/lib/utils";
import { FooterTrust } from "./footer-trust";

export async function Footer() {
  const [general, cms] = await Promise.all([getGeneral(), getCmsPages()]);
  const shop = general.data?.shop;
  const social = shop?.social;
  const pages = (cms.data?.items ?? []).filter((p) => p.enabled !== false).slice(0, 6);

  const cleanTitle = (rawTitle: string | undefined, url: string) => {
    if (rawTitle) {
      const cleaned = rawTitle.replace(/[🌸✨💕🤍🌷📦🛍️]/g, "").trim();
      if (cleaned.length > 0) return cleaned;
    }
    return toPath(url).replace(/^\//, "").replace(/-/g, " ");
  };

  return (
    <footer className="site-footer mt-12 bg-secondary/40 text-foreground">
      {/* Main Footer Links & Brand Section */}
      <div className="container py-8 md:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Store Bio */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/" aria-label={siteConfig.name} className="mb-3 inline-flex">
              <Brand />
            </Link>
            <h2 className="text-xl font-bold text-burgundy text-balance">
              {siteConfig.name}
            </h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground text-pretty max-w-md">
              {shop?.description || siteConfig.description}
            </p>

            {/* Quick trust highlights */}
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-md border border-border/80 bg-card px-2.5 py-1">
                ✨ ارسال به سراسر کشور
              </span>
              <span className="rounded-md border border-border/80 bg-card px-2.5 py-1">
                🔒 بسته‌بندی محرمانه
              </span>
              <span className="rounded-md border border-border/80 bg-card px-2.5 py-1">
                🌸 تضمین کیفیت و لطافت پارچه
              </span>
            </div>
          </div>

          {/* Column 2: Shopping Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-xs font-bold text-burgundy tracking-wide">
              راهنمای خرید
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/search" className="transition-colors hover:text-burgundy">
                  همه محصولات مونا
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="transition-colors hover:text-burgundy">
                  راهنمای سایزبندی
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="transition-colors hover:text-burgundy">
                  پیگیری سفارش
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-burgundy">
                  سبد خرید
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition-colors hover:text-burgundy">
                  حساب کاربری
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Information & CMS Pages */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-xs font-bold text-burgundy tracking-wide">
              اطلاعات و قوانین
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {pages.length ? (
                pages.map((p) => {
                  const title = cleanTitle((p as any).title, p.url);
                  return (
                    <li key={p.url}>
                      <Link href={toPath(p.url)} className="transition-colors hover:text-burgundy">
                        {title}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <>
                  <li>
                    <Link href="/size-guide" className="transition-colors hover:text-burgundy">
                      راهنمای انتخاب سایز
                    </Link>
                  </li>
                  <li>
                    <Link href="/قوانین-و-مقررات" className="transition-colors hover:text-burgundy">
                      قوانین و شرایط خرید
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div className="lg:col-span-3">
            <h3 className="mb-3 text-xs font-bold text-burgundy tracking-wide">
              ارتباط و پشتیبانی
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              {social?.phone1 && (
                <a
                  href={`tel:${social.phone1}`}
                  dir="ltr"
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-card px-3 py-2 text-foreground transition-all hover:border-burgundy/40 hover:text-burgundy"
                >
                  <span className="font-semibold">{social.phone1}</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>تماس مستقیم</span>
                    <Phone className="h-3.5 w-3.5 text-burgundy" />
                  </span>
                </a>
              )}

              <div className="flex gap-2 pt-1">
                {social?.instagram && (
                  <a
                    href={
                      social.instagram.startsWith("http")
                        ? social.instagram
                        : `https://instagram.com/${social.instagram.replace(/^@/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs text-foreground transition-all hover:border-burgundy/40 hover:text-burgundy"
                  >
                    <AtSign className="h-3.5 w-3.5 text-burgundy" />
                    <span>اینستاگرام</span>
                  </a>
                )}
                {social?.telegram && (
                  <a
                    href={
                      social.telegram.startsWith("http")
                        ? social.telegram
                        : `https://t.me/${social.telegram.replace(/^@/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs text-foreground transition-all hover:border-burgundy/40 hover:text-burgundy"
                  >
                    <Send className="h-3.5 w-3.5 text-burgundy" />
                    <span>تلگرام</span>
                  </a>
                )}
              </div>

              <p className="pt-1 text-[11px] leading-5 text-muted-foreground/80 text-pretty">
                همراهی در انتخاب سایز و پاسخگویی به سوالات شما در روزهای کاری
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Verification Badges */}
      <FooterTrust />

      <div className="border-t border-border/70 py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <p>© {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())} {siteConfig.name} — تمامی حقوق محفوظ است.</p>
          <a
            href="https://sazito.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 transition-opacity hover:opacity-90"
            aria-label="قدرت‌گرفته از سازیتو"
          >
            <span className="font-medium text-muted-foreground/80">قدرت‌گرفته از</span>
            <span className="font-bold tracking-tight bg-gradient-to-r from-[#7452E7] via-[#EC4899] to-[#F5BA55] bg-clip-text text-transparent transition-all group-hover:brightness-110">
              سازیتو
            </span>
            <Image
              src="/images/sazito-flame.png"
              alt="لوگوی سازیتو"
              width={20}
              height={13}
              loading="lazy"
              className="h-3.5 w-auto object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
