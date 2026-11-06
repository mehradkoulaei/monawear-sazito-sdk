"use client";
import * as React from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  ChevronLeft,
  ChevronDown,
  Percent,
  Layers,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Home,
  FolderTree,
} from "lucide-react";
import type { MenuItem } from "@sazito/client-sdk";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/components/cart/cart-provider";
import dynamic from "next/dynamic";
const SearchOverlay = dynamic(() => import("./search-overlay").then((m) => m.SearchOverlay));
import { cn, formatNumber, toPath } from "@/lib/utils";

interface Props { menu: MenuItem[]; shopName: string }

export function Header({ menu, shopName }: Props) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mobile, setMobile] = React.useState(false);
  const [search, setSearch] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const desktopNav = React.useRef<HTMLUListElement>(null);
  const openMenu = (i: number) => { clearTimeout(closeTimer.current); setActive(i); };
  const closeMenu = () => { closeTimer.current = setTimeout(() => setActive(null), 120); };
  const activeMenu = active !== null ? menu[active] : undefined;
  const menuGroups = activeMenu?.children.filter((item) => item.children.length > 0) ?? [];
  const menuLinks = activeMenu?.children.filter((item) => item.children.length === 0) ?? [];
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  const Logo = (
    <Link href="/" className="flex items-center" aria-label={shopName}>
      <Brand />
    </Link>
  );

  return (
    <header className="site-header relative z-40 border-b bg-white" onMouseLeave={closeMenu} onKeyDown={(e) => { if (e.key === "Escape" && active !== null) { desktopNav.current?.querySelector<HTMLAnchorElement>(`[data-menu-index="${active}"]`)?.focus(); setActive(null); } }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActive(null); }}>
      <div className="container header-main">
        <button className="header-menu p-2 lg:hidden" onClick={() => { console.log("HEADER_MENU_CLICKED"); setMobile(true); }} aria-label="منو"><Menu className="h-6 w-6" /></button>
        <Link href="/order-tracking" className="header-note hidden lg:block">همراه شما، از انتخاب تا تحویل <span>پیگیری سفارش ←</span></Link><div className="header-brand">{Logo}</div>


        <div className="header-actions flex items-center gap-1">
          <button className="header-search p-2.5 hover:text-burgundy" onClick={() => setSearch(true)} aria-label="جستجو"><Search className="h-5 w-5" /></button>
          <Link href="/account" className="hidden p-2.5 hover:text-burgundy sm:block" aria-label="حساب کاربری"><User className="h-5 w-5" /></Link>
          <button className="relative p-2.5 hover:text-burgundy" onClick={() => setOpen(true)} aria-label="سبد خرید">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <span className="absolute -top-0.5 -end-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-burgundy px-1 text-[10px] text-white">{formatNumber(count)}</span>}
          </button>
        </div>
      </div>

        <nav className="header-nav hidden lg:block border-t border-border/60 bg-white/95 backdrop-blur-sm" aria-label="منوی اصلی">
          <ul
            ref={desktopNav}
            className="container flex items-center justify-center gap-x-1 xl:gap-x-2 py-1 flex-wrap min-h-[49px]"
          >
            {/* All Products */}
            <li onMouseEnter={() => setActive(null)} onFocus={() => setActive(null)}>
              <Link
                href="/search"
                aria-current={pathname === "/search" ? "page" : undefined}
                className={cn(
                  "group relative inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs xl:text-sm font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40",
                  pathname === "/search"
                    ? "font-semibold text-burgundy bg-burgundy/5"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-burgundy"
                )}
              >
                <span>همه محصولات</span>
                <span
                  className={cn(
                    "absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-burgundy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    pathname === "/search"
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-75"
                  )}
                  aria-hidden="true"
                />
              </Link>
            </li>

            {/* Menu items from Sazito */}
            {menu.slice(0, 7).map((m, i) => {
              const itemPath = toPath(m.url);
              const isCurrent =
                itemPath === "/"
                  ? pathname === "/"
                  : itemPath.startsWith("/category/")
                  ? pathname.startsWith("/category/")
                  : pathname === itemPath || pathname.startsWith(itemPath + "/");
              const isMegaOpen = active === i;
              const hasChildren = m.children.length > 0;

              return (
                <li
                  key={m.url + i}
                  onMouseEnter={() => (hasChildren ? openMenu(i) : setActive(null))}
                  onFocus={() => (hasChildren ? openMenu(i) : setActive(null))}
                >
                  <Link
                    href={itemPath}
                    data-menu-index={i}
                    aria-current={isCurrent ? "page" : undefined}
                    aria-haspopup={hasChildren ? "true" : undefined}
                    aria-expanded={hasChildren ? isMegaOpen : undefined}
                    aria-controls={hasChildren && isMegaOpen ? `header-mega-${i}` : undefined}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" && hasChildren) {
                        event.preventDefault();
                        openMenu(i);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(`header-mega-${i}`)
                            ?.querySelector<HTMLAnchorElement>("a")
                            ?.focus()
                        );
                      }
                    }}
                    onClick={() => setActive(null)}
                    className={cn(
                      "group relative !inline-flex flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs xl:text-sm font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40",
                      isMegaOpen || isCurrent
                        ? "font-semibold text-burgundy bg-burgundy/5"
                        : "text-foreground/80 hover:bg-muted/60 hover:text-burgundy"
                    )}
                  >
                    <span className="whitespace-nowrap">{m.name}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          isMegaOpen
                            ? "rotate-180 text-burgundy"
                            : "text-muted-foreground group-hover:text-burgundy"
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-burgundy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isMegaOpen || isCurrent
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-75"
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}

            {/* New In (تازه‌ها) */}
            <li onMouseEnter={() => setActive(null)} onFocus={() => setActive(null)}>
              <Link
                href="/search?sort=newest"
                className="group relative !inline-flex flex-row items-center justify-center rounded-lg px-3 py-2 text-xs xl:text-sm font-medium tracking-tight text-foreground/80 hover:bg-muted/60 hover:text-burgundy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
              >
                <span className="whitespace-nowrap">تازه‌ها</span>
                <span
                  className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-burgundy opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-75 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  aria-hidden="true"
                />
              </Link>
            </li>

            {/* Sale / Discounts (تخفیف‌های مونا) - High-Conversion Luxury Badge */}
            <li onMouseEnter={() => setActive(null)} onFocus={() => setActive(null)} className="ms-1">
              <Link
                href="/search?discounted=1"
                className="!inline-flex flex-row items-center justify-center gap-1.5 rounded-full border border-burgundy/25 bg-burgundy/10 px-3.5 py-1 text-xs font-semibold text-burgundy shadow-2xs hover:border-burgundy hover:bg-burgundy hover:text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
              >
                <Percent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">تخفیف‌های مونا</span>
              </Link>
            </li>
          </ul>
        </nav>

      {/* Mega menu */}
      {!!activeMenu?.children.length && (
        <nav id={`header-mega-${active}`} aria-label={`دسته‌بندی ${activeMenu.name}`} className="mega-menu-panel" onMouseEnter={() => clearTimeout(closeTimer.current)}>
          <div className="mega-menu-heading">
            <span className="mega-menu-title">{activeMenu.name}</span>
            <Link href={toPath(activeMenu.url)} onClick={() => setActive(null)} className="mega-menu-all">مشاهده همه <ChevronLeft size={16} aria-hidden="true" /></Link>
          </div>
          <div className={cn("mega-menu-body", menuGroups.length > 0 && menuLinks.length > 0 && "has-groups")}>
            {menuGroups.length > 0 && <div className="mega-menu-groups">{menuGroups.map((group) => <section key={group.url + group.name}>
              <Link href={toPath(group.url)} onClick={() => setActive(null)} className="mega-menu-group-title">{group.name}<ChevronLeft size={16} aria-hidden="true" /></Link>
              <ul>{group.children.map((child) => <li key={child.url + child.name}><Link href={toPath(child.url)} onClick={() => setActive(null)}>{child.name}</Link></li>)}</ul>
            </section>)}</div>}
            {menuLinks.length > 0 && <ul className="mega-menu-links">{menuLinks.map((item) => <li key={item.url + item.name}>
              <Link href={toPath(item.url)} onClick={() => setActive(null)}>{item.name}<ChevronLeft size={16} aria-hidden="true" /></Link>
            </li>)}</ul>}
          </div>
        </nav>
      )}

      {/* Mobile navigation (RTL: opens from the right) */}
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent
          side="start"
          title="منوی دسترسی"
          headerContent={
            <div className="flex items-center gap-2">
              <Brand className="scale-90 origin-right text-burgundy" />
            </div>
          }
        >
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-4 no-scrollbar" aria-label="منوی موبایل">
            {/* 1. Quick Search Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobile(false);
                setSearch(true);
              }}
              className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 text-xs text-muted-foreground transition-colors duration-150 hover:border-burgundy/40 hover:text-foreground active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy"
              aria-label="جستجوی محصولات، رنگ و سایز"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              <span className="truncate">جستجوی محصول، دسته‌بندی یا کد...</span>
            </button>

            {/* 2. Featured Collections (No shouty AI badges, refined surfaces) */}
            <div className="grid grid-cols-2 gap-2">
              {/* تخفیف‌های مونا */}
              <Link
                href="/search?discounted=1"
                onClick={() => setMobile(false)}
                className="group flex flex-col justify-between rounded-lg border border-burgundy/25 bg-burgundy/5 p-3 transition-colors duration-150 hover:bg-burgundy/10 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy"
              >
                <Percent className="h-4 w-4 text-burgundy" strokeWidth={1.5} aria-hidden="true" />
                <div className="mt-2.5">
                  <span className="block text-xs font-semibold text-burgundy">
                    تخفیف‌های مونا
                  </span>
                  <span className="block text-[11px] text-burgundy/75">
                    قیمت‌های ویژه
                  </span>
                </div>
              </Link>

              {/* تازه‌ها */}
              <Link
                href="/search?sort=newest"
                onClick={() => setMobile(false)}
                className="group flex flex-col justify-between rounded-lg border border-border/60 bg-card/60 p-3 transition-colors duration-150 hover:border-burgundy/30 hover:bg-muted/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy"
              >
                <Layers className="h-4 w-4 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />
                <div className="mt-2.5">
                  <span className="block text-xs font-semibold text-foreground group-hover:text-burgundy transition-colors">
                    تازه‌ترین‌ها
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    کالکشن جدید
                  </span>
                </div>
              </Link>
            </div>

            {/* 3. Catalog & Category Navigation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  دسته‌بندی محصولات
                </span>
                <Link
                  href="/search"
                  onClick={() => setMobile(false)}
                  className="flex items-center gap-1 text-[11px] font-medium text-burgundy hover:underline"
                >
                  <ShoppingBag className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  <span>همه محصولات</span>
                </Link>
              </div>

              {/* Homepage Link */}
              <Link
                href="/"
                onClick={() => setMobile(false)}
                className={cn(
                  "flex h-10 items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                  pathname === "/"
                    ? "border-burgundy/30 bg-burgundy/5 font-semibold text-burgundy"
                    : "border-border/60 bg-card/60 text-foreground hover:border-border hover:bg-muted/30"
                )}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  <span>صفحه اصلی</span>
                </span>
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} aria-hidden="true" />
              </Link>

              {/* Sazito Categories Accordion */}
              <Accordion type="multiple" className="space-y-1.5">
                {menu.map((m, i) => {
                  const path = toPath(m.url);
                  if (path === "/" || path === "/order-tracking" || path === "/پیگیری-سفارشات" || path === "/size-guide" || path === "/راهنمای-سایزبندی") {
                    return null;
                  }

                  const isMainCategoryActive = pathname === path || pathname.startsWith(path + "/");

                  return m.children.length ? (
                    <AccordionItem
                      key={m.url + i}
                      value={`m${i}`}
                      className="rounded-lg border border-border/60 bg-card/60 overflow-hidden transition-colors"
                    >
                      <AccordionTrigger
                        className={cn(
                          "min-h-[42px] px-3 py-2 text-xs font-medium transition-colors hover:no-underline hover:text-burgundy",
                          isMainCategoryActive && "text-burgundy font-semibold bg-burgundy/5"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                          <span>{m.name}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-border/50 bg-muted/20 px-2.5 py-1.5">
                        <ul className="space-y-0.5">
                          <li>
                            <Link
                              href={path}
                              onClick={() => setMobile(false)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-muted/60 hover:text-burgundy active:scale-[0.99]",
                                pathname === path ? "bg-burgundy/10 font-semibold text-burgundy" : "font-medium text-foreground"
                              )}
                            >
                              <span>همه {m.name}</span>
                              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" />
                            </Link>
                          </li>
                          {m.children.map((c) => {
                            const cPath = toPath(c.url);
                            const isChildActive = pathname === cPath;
                            return (
                              <li key={c.url + c.name}>
                                <Link
                                  href={cPath}
                                  onClick={() => setMobile(false)}
                                  className={cn(
                                    "flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-muted/60 hover:text-burgundy active:scale-[0.99]",
                                    isChildActive ? "bg-burgundy/10 font-semibold text-burgundy" : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <span>{c.name}</span>
                                  <ChevronLeft className="h-3 w-3 text-muted-foreground/50" strokeWidth={1.5} aria-hidden="true" />
                                </Link>
                                {c.children.length > 0 && (
                                  <ul className="my-1 space-y-0.5 pe-2 ps-3 border-s border-border/50 ms-3">
                                    {c.children.map((g) => {
                                      const gPath = toPath(g.url);
                                      const isGrandchildActive = pathname === gPath;
                                      return (
                                        <li key={g.url + g.name}>
                                          <Link
                                            href={gPath}
                                            onClick={() => setMobile(false)}
                                            className={cn(
                                              "block rounded px-2 py-1.5 text-[11px] transition-colors hover:text-burgundy",
                                              isGrandchildActive ? "font-semibold text-burgundy" : "text-muted-foreground hover:text-foreground"
                                            )}
                                          >
                                            {g.name}
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div key={m.url + i}>
                      <Link
                        href={path}
                        onClick={() => setMobile(false)}
                        className={cn(
                          "flex h-10 items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                          isMainCategoryActive
                            ? "border-burgundy/30 bg-burgundy/5 font-semibold text-burgundy"
                            : "border-border/60 bg-card/60 text-foreground hover:border-border hover:bg-muted/30"
                        )}
                      >
                        <span>{m.name}</span>
                        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </Accordion>
            </div>

            {/* 4. Customer Services (Refined 2x2 grid, quiet chrome, single accent) */}
            <div className="space-y-2 pt-1">
              <span className="block px-0.5 text-[11px] font-medium text-muted-foreground">
                خدمات مشتریان
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* پیگیری سفارش */}
                <Link
                  href="/order-tracking"
                  onClick={() => setMobile(false)}
                  className={cn(
                    "group flex flex-col justify-between rounded-lg border p-3 transition-colors duration-150 hover:border-burgundy/30 hover:bg-muted/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                    pathname.startsWith("/order-tracking") || pathname.startsWith("/پیگیری-سفارشات")
                      ? "border-burgundy/30 bg-burgundy/5"
                      : "border-border/60 bg-card/60"
                  )}
                >
                  <PackageSearch className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-burgundy" strokeWidth={1.5} aria-hidden="true" />
                  <div className="mt-2.5">
                    <span className="block text-xs font-medium text-foreground transition-colors group-hover:text-burgundy">
                      پیگیری سفارش
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      رهگیری مرسوله پستی
                    </span>
                  </div>
                </Link>

                {/* راهنمای سایزبندی */}
                <Link
                  href="/size-guide"
                  onClick={() => setMobile(false)}
                  className={cn(
                    "group flex flex-col justify-between rounded-lg border p-3 transition-colors duration-150 hover:border-burgundy/30 hover:bg-muted/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                    pathname.startsWith("/size-guide") || pathname.startsWith("/راهنمای-سایزبندی")
                      ? "border-burgundy/30 bg-burgundy/5"
                      : "border-border/60 bg-card/60"
                  )}
                >
                  <Ruler className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-burgundy" strokeWidth={1.5} aria-hidden="true" />
                  <div className="mt-2.5">
                    <span className="block text-xs font-medium text-foreground transition-colors group-hover:text-burgundy">
                      راهنمای سایز
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      جدول دقیق ابعاد
                    </span>
                  </div>
                </Link>

                {/* حساب کاربری */}
                <Link
                  href="/account"
                  onClick={() => setMobile(false)}
                  className={cn(
                    "group flex flex-col justify-between rounded-lg border p-3 transition-colors duration-150 hover:border-burgundy/30 hover:bg-muted/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                    pathname.startsWith("/account")
                      ? "border-burgundy/30 bg-burgundy/5"
                      : "border-border/60 bg-card/60"
                  )}
                >
                  <User className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-burgundy" strokeWidth={1.5} aria-hidden="true" />
                  <div className="mt-2.5">
                    <span className="block text-xs font-medium text-foreground transition-colors group-hover:text-burgundy">
                      حساب کاربری
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      سفارش‌ها و اطلاعات
                    </span>
                  </div>
                </Link>

                {/* قوانین و شرایط */}
                <Link
                  href="/terms"
                  onClick={() => setMobile(false)}
                  className={cn(
                    "group flex flex-col justify-between rounded-lg border p-3 transition-colors duration-150 hover:border-burgundy/30 hover:bg-muted/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy",
                    pathname.startsWith("/terms") || pathname.startsWith("/قوانین-و-مقررات")
                      ? "border-burgundy/30 bg-burgundy/5"
                      : "border-border/60 bg-card/60"
                  )}
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-burgundy" strokeWidth={1.5} aria-hidden="true" />
                  <div className="mt-2.5">
                    <span className="block text-xs font-medium text-foreground transition-colors group-hover:text-burgundy">
                      قوانین و ضمانت
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      شرایط ارسال و تعویض
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* 5. Drawer Footer Note */}
            <div className="mt-auto pt-3 border-t border-border/50 text-center space-y-0.5">
              <p className="text-[11px] font-medium text-foreground/80">
                مونا وِر • Monawear
              </p>
              <p className="text-[10px] text-muted-foreground">
                لباس خواب و راحتی بانوان با کیفیت اختصاصی
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {search && <SearchOverlay open={search} onOpenChange={setSearch} />}
      <nav
        className="mobile-dock styles__bottom-menu___TwX42 styles__hardCorners___TN1yx fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white/98 backdrop-blur-md border-t border-border/70 shadow-[0_-2px_14px_rgba(0,0,0,0.04)]"
        aria-label="دسترسی سریع موبایل"
      >
        <div className="styles__menu-container___R58eY flex items-center justify-around w-full max-w-lg mx-auto px-1 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
          {/* 1. Home */}
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(
              "styles__menu-item___v7hhi group relative flex flex-1 flex-col items-center justify-center gap-1.5 min-h-[56px] py-1 px-1 rounded-xl transition-colors duration-150 select-none",
              pathname === "/"
                ? "styles__active___stn1B text-burgundy font-semibold"
                : "text-[#5e5257] hover:text-foreground font-medium"
            )}
          >
            <div className="styles__icon-wrapper___yZSPt relative flex items-center justify-center w-7 h-7 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill={pathname === "/" ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M19.842 8.29876L13.842 3.63176C12.759 2.78876 11.242 2.78876 10.158 3.63176L4.15801 8.29876C3.42701 8.86676 3.00001 9.74076 3.00001 10.6668V17.9998C3.00001 19.6568 4.34301 20.9998 6.00001 20.9998H18C19.657 20.9998 21 19.6568 21 17.9998V10.6668C21 9.74076 20.573 8.86676 19.842 8.29876Z" stroke="currentColor" strokeWidth={pathname === "/" ? 1.8 : 1.5}></path>
              </svg>
            </div>
            <span className="styles__menu-label___B2wue text-[12px] leading-none select-none">خانه</span>
          </Link>

          {/* 2. Categories */}
          <button
            type="button"
            onClick={() => setMobile(true)}
            aria-label="دسته‌بندی‌ها"
            className={cn(
              "styles__menu-item___v7hhi group relative flex flex-1 flex-col items-center justify-center gap-1.5 min-h-[56px] py-1 px-1 rounded-xl transition-colors duration-150 select-none focus-visible:outline-none",
              mobile || pathname.startsWith("/category")
                ? "styles__active___stn1B text-burgundy font-semibold"
                : "text-[#5e5257] hover:text-foreground font-medium"
            )}
          >
            <div className="styles__icon-wrapper___yZSPt relative flex items-center justify-center w-7 h-7 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M21 5V7.75C21 8.855 20.105 9.75 19 9.75H5C3.895 9.75 3 8.855 3 7.75V5C3 3.895 3.895 3 5 3H19C20.105 3 21 3.895 21 5Z" stroke="currentColor" strokeWidth={mobile || pathname.startsWith("/category") ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                <path fillRule="evenodd" clipRule="evenodd" d="M21 16.25V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V16.25C3 15.145 3.895 14.25 5 14.25H19C20.105 14.25 21 15.145 21 16.25Z" stroke="currentColor" strokeWidth={mobile || pathname.startsWith("/category") ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="styles__menu-label___B2wue text-[12px] leading-none select-none">دسته‌بندی‌ها</span>
          </button>

          {/* 3. Search */}
          <button
            type="button"
            onClick={() => setSearch(true)}
            aria-label="جستجو"
            className={cn(
              "styles__menu-item___v7hhi group relative flex flex-1 flex-col items-center justify-center gap-1.5 min-h-[56px] py-1 px-1 rounded-xl transition-colors duration-150 select-none focus-visible:outline-none",
              search || pathname === "/search"
                ? "styles__active___stn1B text-burgundy font-semibold"
                : "text-[#5e5257] hover:text-foreground font-medium"
            )}
          >
            <div className="styles__icon-wrapper___yZSPt relative flex items-center justify-center w-7 h-7 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="11.059" cy="11.059" r="7.059" stroke="currentColor" strokeWidth={search || pathname === "/search" ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></circle>
                <path d="M20 19.9998L16.05 16.0498" stroke="currentColor" strokeWidth={search || pathname === "/search" ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="styles__menu-label___B2wue text-[12px] leading-none select-none">جستجو</span>
          </button>

          {/* 4. Cart */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`سبد خرید${count > 0 ? ` (${formatNumber(count)} کالا)` : ""}`}
            className={cn(
              "styles__menu-item___v7hhi group relative flex flex-1 flex-col items-center justify-center gap-1.5 min-h-[56px] py-1 px-1 rounded-xl transition-colors duration-150 select-none focus-visible:outline-none",
              count > 0
                ? "text-burgundy font-semibold"
                : "text-[#5e5257] hover:text-foreground font-medium"
            )}
          >
            <div className="styles__icon-wrapper___yZSPt relative flex items-center justify-center w-7 h-7 shrink-0">
              {count > 0 && (
                <span className="styles__badge___qakfU smartTextColor__wrapper___BmwOo absolute -top-1 -end-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-white tabular-nums leading-none shadow-2xs">
                  {formatNumber(count)}
                </span>
              )}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M19.6001 6.467L17.9001 4.2C17.3331 3.445 16.4441 3 15.5001 3H8.50006C7.55606 3 6.66706 3.445 6.10006 4.2L4.40006 6.467C4.14006 6.813 4.00006 7.234 4.00006 7.667V18C4.00006 19.657 5.34306 21 7.00006 21H17.0001C18.6571 21 20.0001 19.657 20.0001 18V7.667C20.0001 7.234 19.8601 6.813 19.6001 6.467Z" stroke="currentColor" strokeWidth={count > 0 ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M15.0001 10C15.0001 11.657 13.6571 13 12.0001 13C10.3431 13 9.00006 11.657 9.00006 10" stroke="currentColor" strokeWidth={count > 0 ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M19.8802 7H4.12018" stroke="currentColor" strokeWidth={count > 0 ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="styles__menu-label___B2wue text-[12px] leading-none select-none">سبد خرید</span>
          </button>

          {/* 5. Account */}
          <Link
            href="/account"
            aria-current={pathname.startsWith("/account") ? "page" : undefined}
            className={cn(
              "styles__menu-item___v7hhi group relative flex flex-1 flex-col items-center justify-center gap-1.5 min-h-[56px] py-1 px-1 rounded-xl transition-colors duration-150 select-none",
              pathname.startsWith("/account")
                ? "styles__active___stn1B text-burgundy font-semibold"
                : "text-[#5e5257] hover:text-foreground font-medium"
            )}
          >
            <div className="styles__icon-wrapper___yZSPt relative flex items-center justify-center w-7 h-7 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M14.4749 4.52513C15.8417 5.89197 15.8417 8.10804 14.4749 9.47488C13.1081 10.8417 10.892 10.8417 9.52515 9.47488C8.15831 8.10804 8.15831 5.89197 9.52515 4.52513C10.892 3.15829 13.1081 3.15829 14.4749 4.52513" stroke="currentColor" strokeWidth={pathname.startsWith("/account") ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                <path fillRule="evenodd" clipRule="evenodd" d="M4 18.4998V19.4998C4 20.0518 4.448 20.4998 5 20.4998H19C19.552 20.4998 20 20.0518 20 19.4998V18.4998C20 15.4738 16.048 13.5078 12 13.5078C7.952 13.5078 4 15.4738 4 18.4998Z" stroke="currentColor" strokeWidth={pathname.startsWith("/account") ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="styles__menu-label___B2wue text-[12px] leading-none select-none">حساب من</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
