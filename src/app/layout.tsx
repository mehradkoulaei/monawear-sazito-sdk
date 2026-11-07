import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { VisitTracker } from "@/components/visit-tracker";
import { QuickHelp } from "@/components/help/quick-help";

const vazirmatn = localFont({ src: "../../node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2", display: "swap", variable: "--font-mona", weight: "100 900" });
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} | ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/images/brand/v2/mona-hero-studio-1440.webp",
        width: 1440,
        height: 1080,
        alt: `${siteConfig.name} - ${siteConfig.tagline}`,
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/brand/v2/mona-hero-studio-1440.webp"],
  },
};
export const viewport: Viewport = { themeColor: "#5e1f2f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} min-h-screen`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-2 focus:top-2 focus:z-[200] focus:bg-background focus:p-3">پرش به محتوای اصلی</a>
        <Providers>
          <div className="sticky top-0 z-40 w-full">
            <AnnouncementBar />
            <Suspense fallback={<Header menu={[]} shopName={siteConfig.name} />}><SiteHeader /></Suspense>
          </div>
          <main id="main">{children}</main>
          <Suspense fallback={<footer className="site-footer h-80 bg-secondary/40" aria-busy="true" />}><Footer /></Suspense>
          <CartDrawer />
          <VisitTracker />
          <QuickHelp />
        </Providers>
      </body>
    </html>
  );
}
