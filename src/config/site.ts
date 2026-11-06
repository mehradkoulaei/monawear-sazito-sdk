/**
 * Central, editable site configuration.
 * Everything here is presentation config — product, price and stock data ALWAYS come from Sazito.
 */
export const siteConfig = {
  name: "پوشاک مونا",
  nameEn: "Mona Wear",
  logo: "/images/brand/mona-logo.png",
  tagline: "پوشاک زنانه و لباس راحتی",
  description: "فروشگاه اینترنتی پوشاک مونا؛ بادی، ست، ماکسی، لباس راحتی و اکسسوری زنانه.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://monawear.ir",
  locale: "fa_IR",

  /**
   * Price display. The SDK types do not state the currency unit.
   * Verify against real API responses, then set `priceDivisor` (1 = show as returned,
   * 10 = backend returns Rial and you want Toman).
   */
  currencyLabel: "تومان",
  /** ISO currency code used ONLY in product structured data (JSON-LD). Verify against the backend unit. */
  jsonLdCurrency: "IRR",
  priceDivisor: 1,

  /** Announcement marquee messages (edit freely). */
  announcements: [
    "اولین باره اینجایی؟ دنیای مونا رو کشف کن",
    "سایز مناسب تو، برای احساس راحتی بیشتر",
    "حال‌وهوای تازه با جدیدترین مدل‌های مونا",
  ],

  /** Exact banner copy recovered from v2 components/storefront.tsx. Links use v3 routes. */
  heroSlides: [
    {
      id: "mona-collection", kind: "hero", eyebrow: "THE MONA COLLECTION", intro: "پوشاک مونا",
      title: "لباس خواب و راحتی،\nبه انتخاب تو",
      text: "مدل‌های مونا را ببین؛ از بادی و لباس خواب تا ست‌های راحتی.\nتصاویر و سایز هر مدل در صفحهٔ محصول آمده است.",
      href: "/search", cta: "دیدن محصولات", image: "/images/brand/v2/mona-hero-studio-1440.webp",
      alt: "تصویر تبلیغاتی ست ساتن زرشکی با الهام از کالکشن مونا",
      annotation: "SOFT FEELING. BEAUTIFUL YOU.", edition: "MONA / EVERYDAY COLLECTION",
      footnote: "تصاویر، قیمت و گزینه‌های هر مدل", signature: "", stamp: true,
    },
  ],
  softEdit: {
      id: "soft-edit", kind: "soft-edit", eyebrow: "LITTLE LUXURIES, EVERY DAY", intro: "",
      title: "لباس خواب،\nبه انتخاب تو",
      text: "مدل‌های لباس خواب مونا را ببین.\nبرای مقایسهٔ طرح، سایز و قیمت،\nجزئیات هر محصول را باز کن.",
      href: "/search?q=لباس%20خواب", cta: "دیدن مدل‌های لباس خواب", image: "/images/brand/mona-lilac-pajamas-1440.webp",
      alt: "بنر اختصاصی ست پیژامهٔ ساتن یاسی مونا با گل‌های سفید روی زمینهٔ صورتی لطیف",
      annotation: "", edition: "THE SOFT EDIT", footnote: "", signature: "A little love for yourself.", stamp: false,
    },
  collections: [
    { name: "بادی", categoryId: 1, image: "/images/brand/v2/mona-category-1-studio-1200.webp", text: "مدل‌ها و گزینه‌های سایز" },
    { name: "لباس خواب", categoryId: 8, image: "/images/brand/v2/mona-category-2-studio-1200.webp", text: "تصاویر و جزئیات هر مدل" },
    { name: "تاپ و شلوار", categoryId: 11, image: "/images/brand/v2/mona-category-3-studio-1200.webp", text: "ست‌های دو تکهٔ مونا" },
    { name: "فانتزی", categoryId: 16, image: "/images/brand/v2/mona-category-4-studio-1200.webp", text: "طرح‌ها و مدل‌های فانتزی" },
  ],

  /**
   * Shop the Look. Add real product IDs from your Sazito store to enable the section.
   * Leave `productIds` empty to hide it. No fake products are ever rendered.
   */
  shopTheLook: { title: "استایل کامل را بخرید", productIds: [] as number[] },

  trust: [
    { icon: "shield", title: "پرداخت امن", text: "پرداخت از طریق درگاه‌های فعال فروشگاه" },
    { icon: "truck", title: "ارسال", text: "روش‌های ارسال را هنگام ثبت سفارش ببینید" },
    { icon: "ruler", title: "راهنمای سایز", text: "قبل از خرید سایز مناسب را پیدا کنید" },
    { icon: "headset", title: "پشتیبانی", text: "راه‌های ارتباط با فروشگاه در پایین صفحه" },
  ],

  faq: [
    { q: "چطور سایز مناسب را انتخاب کنم؟", a: "اندازه‌های خود را با جدول همان محصول مقایسه کنید. اگر جدول سایز برای مدل موردنظر درج نشده، پیش از خرید از پشتیبانی راهنمایی بگیرید." },
    { q: "چطور سفارشم را پیگیری کنم؟", a: "از صفحه «پیگیری سفارش» یا بخش «سفارش‌های من» در حساب کاربری استفاده کنید." },
    { q: "آیا بدون ثبت‌نام می‌توانم خرید کنم؟", a: "بله، خرید مهمان در صورت فعال بودن در فروشگاه امکان‌پذیر است." },
  ],

  /** Optional CMS page path (as defined in Sazito) used by the size guide dialog. */
  sizeGuideCmsPath: "/size-guide",

  /** Footer quick links. CMS pages from Sazito are appended automatically. */
  footerLinks: [
    { label: "راهنمای سایز", href: "/size-guide" },
    { label: "پیگیری سفارش", href: "/order-tracking" },
    { label: "سبد خرید", href: "/cart" },
    { label: "حساب کاربری", href: "/account" },
  ],
  /** Admin-style Sazito operations are DISABLED unless you explicitly turn them on. */
  featureFlags: { imageAdminRoutes: false },
} as const;

export type SiteConfig = typeof siteConfig;
