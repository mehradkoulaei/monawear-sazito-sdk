"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ruler,
  CheckCircle2,
  Info,
  ChevronLeft,
  HelpCircle,
  Table as TableIcon,
  FileText,
  Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  calculateSize,
  MONA_SIZE_CHART,
  type SizeResult,
} from "@/components/products/interactive-size-calculator";
import { toFaDigits } from "@/lib/utils";

/** Quick measurement instructions */
export function MeasuringGuide() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/10 text-xs font-bold text-burgundy">
            ۱
          </div>
          <h4 className="text-sm font-semibold text-foreground text-balance">دور سینه</h4>
          <p className="mt-1 text-xs leading-6 text-muted-foreground text-pretty">
            متر خیاطی را روی برجسته‌ترین بخش سینه قرار داده و موازی با زمین، بدون کشش زیاد اندازه بگیرید.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/10 text-xs font-bold text-burgundy">
            ۲
          </div>
          <h4 className="text-sm font-semibold text-foreground text-balance">دور کمر</h4>
          <p className="mt-1 text-xs leading-6 text-muted-foreground text-pretty">
            باریک‌ترین قسمت بالاتنه (حدود ۲ تا ۳ سانتی‌متر بالاتر از ناف) را در حالت بازدم طبیعی اندازه بگیرید.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/10 text-xs font-bold text-burgundy">
            ۳
          </div>
          <h4 className="text-sm font-semibold text-foreground text-balance">دور باسن</h4>
          <p className="mt-1 text-xs leading-6 text-muted-foreground text-pretty">
            پاها را کنار هم قرار داده و متر را دور برجسته‌ترین و پهن‌ترین قسمت باسن اندازه بگیرید.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-secondary/30 p-4">
        <p className="text-xs leading-6 text-muted-foreground text-pretty">
          <strong className="text-foreground">💡 نکته طلایی مونا: </strong>
          متر را محکم اما بدون فشار به بدن نگه دارید. در صورتی که بین دو سایز قرار گرفتید، برای لباس خواب و ست‌های راحتی همیشه سایز بزرگ‌تر احساس آزادی و زیبایی بیشتری به اندام می‌دهد.
        </p>
      </div>
    </div>
  );
}

export function SizeGuideDialog({ html }: { html?: string }) {
  const [activeTab, setActiveTab] = useState<"calc" | "chart" | "measure" | "custom">(
    html ? "custom" : "calc"
  );
  const [bust, setBust] = useState<number>(92);
  const [waist, setWaist] = useState<number>(72);
  const [hip, setHip] = useState<number>(98);

  const result: SizeResult = calculateSize(bust, waist, hip);

  const applyPreset = (b: number, w: number, h: number) => {
    setBust(b);
    setWaist(w);
    setHip(h);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="pdp-size-guide-btn group inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/35 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors duration-200 hover:border-burgundy/35 hover:bg-secondary/70 hover:text-burgundy active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          aria-label="راهنمای انتخاب سایز و محاسبه‌گر اندازه"
        >
          <Ruler className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-200 group-hover:text-burgundy" strokeWidth={1.5} />
          <span>راهنمای انتخاب سایز</span>
        </button>
      </DialogTrigger>

      <DialogContent
        title="راهنمای سایزبندی و محاسبه‌گر اندازه"
        className="max-w-2xl sm:max-w-3xl rounded-2xl p-0 overflow-hidden border border-border/80 shadow-2xl bg-background"
      >
        {/* Header */}
        <div className="border-b border-border/70 bg-secondary/25 px-6 py-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-burgundy">
            <Ruler className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>راهنمای سایزبندی مونا</span>
          </div>
          <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground text-balance sm:text-2xl">
            سایز مناسب خود را پیدا کنید
          </h3>
          <p className="mt-1 text-xs leading-6 text-muted-foreground text-pretty sm:text-sm">
            اندازه‌های خود را در محاسبه‌گر اندازه وارد کنید یا از جدول مقایسه‌ای استاندارد کمک بگیرید.
          </p>

          {/* Segmented Tabs */}
          <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-border/80 bg-background/90 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("calc")}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 active:scale-[0.98] ${
                activeTab === "calc"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Ruler className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>محاسبه‌گر اندازه</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chart")}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                activeTab === "chart"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>جدول استاندارد مونا</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("measure")}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                activeTab === "measure"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>آموزش اندازه‌گیری</span>
            </button>

            {html && (
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                  activeTab === "custom"
                    ? "bg-burgundy text-white shadow-xs"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>مشخصات این محصول</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* TAB 1: SMART CALCULATOR */}
          {activeTab === "calc" && (
            <div className="space-y-6">
              {/* Quick Presets */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  انتخاب سریع بر اساس سایز معمول شما:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "سایز ۳۶ (S)", b: 86, w: 66, h: 92 },
                    { label: "سایز ۳۸ (M)", b: 90, w: 70, h: 96 },
                    { label: "سایز ۴۰ (L / فری)", b: 94, w: 74, h: 100 },
                    { label: "سایز ۴۲ (XL)", b: 98, w: 78, h: 104 },
                    { label: "سایز ۴۶+ (بیگ سایز)", b: 106, w: 86, h: 112 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.b, p.w, p.h)}
                      className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-burgundy hover:bg-burgundy/5 active:scale-[0.97]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Measurement Inputs */}
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Bust */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">۱. دور سینه</span>
                    <span className="text-xs font-bold text-burgundy">{toFaDigits(bust)} cm</span>
                  </div>
                  <input
                    type="range"
                    min={65}
                    max={135}
                    value={bust}
                    onChange={(e) => setBust(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>۶۵ cm</span>
                    <span>۱۳۵ cm</span>
                  </div>
                </div>

                {/* Waist */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">۲. دور کمر</span>
                    <span className="text-xs font-bold text-burgundy">{toFaDigits(waist)} cm</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={125}
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>۵۰ cm</span>
                    <span>۱۲۵ cm</span>
                  </div>
                </div>

                {/* Hip */}
                <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">۳. دور باسن</span>
                    <span className="text-xs font-bold text-burgundy">{toFaDigits(hip)} cm</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={145}
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>۷۰ cm</span>
                    <span>۱۴۵ cm</span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="rounded-xl border border-burgundy/25 bg-card p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-burgundy" />
                      <span className="text-xs font-semibold text-burgundy">سایز پیشنهادی برای شما</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2.5">
                      <span className="text-xl font-bold text-foreground sm:text-2xl">
                        {result.letterSize}
                      </span>
                      <span className="rounded-md bg-burgundy/10 px-2 py-0.5 text-xs font-bold text-burgundy">
                        EU {toFaDigits(result.euSize)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      مناسب کاپ سوتین: <strong className="text-foreground">{toFaDigits(result.braCup)}</strong>
                    </p>
                  </div>

                  <DialogClose asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-burgundy/90 active:scale-[0.98]"
                    >
                      <Check className="h-4 w-4" />
                      <span>تأیید و انتخاب سایز</span>
                    </button>
                  </DialogClose>
                </div>

                <div className="mt-3 border-t border-border/80 pt-3">
                  <p className="text-xs leading-6 text-foreground/85 text-pretty">
                    <span className="font-semibold text-burgundy">💡 توصیه تن‌خور: </span>
                    {result.fitAdvice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIZE STANDARDS TABLE */}
          {activeTab === "chart" && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-border/80">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-secondary/40 text-foreground">
                      <th className="py-2.5 px-3 font-semibold">سایز EU</th>
                      <th className="py-2.5 px-3 font-semibold">عنوان در مونا</th>
                      <th className="py-2.5 px-3 font-semibold">دور سینه</th>
                      <th className="py-2.5 px-3 font-semibold">دور کمر</th>
                      <th className="py-2.5 px-3 font-semibold">دور باسن</th>
                      <th className="py-2.5 px-3 font-semibold">کاپ پیشنهادی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {MONA_SIZE_CHART.map((row) => (
                      <tr
                        key={row.eu}
                        className={`transition-colors hover:bg-secondary/30 ${
                          row.eu === result.euSize
                            ? "bg-burgundy/10 font-bold text-burgundy"
                            : "text-muted-foreground"
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-foreground">EU {toFaDigits(row.eu)}</td>
                        <td className="py-2.5 px-3">{row.label}</td>
                        <td className="py-2.5 px-3">{row.bust} cm</td>
                        <td className="py-2.5 px-3">{row.waist} cm</td>
                        <td className="py-2.5 px-3">{row.hip} cm</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{toFaDigits(row.bra)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Between sizes advice */}
              <div className="flex gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                  <Info className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground text-balance">
                    اگر بین دو سایز قرار داشتید چه انتخابی مناسب‌تر است؟
                  </h4>
                  <p className="text-xs leading-6 text-muted-foreground text-pretty">
                    در لباس خواب زنانه و ست‌های راحتی مونا، اگر اندازه‌های شما در مرز دو سایز قرار می‌گیرد یا سایز بالاتنه با پایین‌تنه‌تان متفاوت است، همیشه <strong>انتخاب سایز بزرگ‌تر</strong> پیشنهاد می‌شود؛ پارچه‌های ساتن و حریر با کمی آزادی افتادگی بسیار شیک‌تری روی اندام دارند.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEASURING INSTRUCTIONS */}
          {activeTab === "measure" && <MeasuringGuide />}

          {/* TAB 4: PRODUCT-SPECIFIC HTML */}
          {activeTab === "custom" && html && (
            <div className="cms-content text-sm leading-7 rounded-xl border border-border/80 bg-card p-4">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-border/70 bg-secondary/20 px-6 py-4 sm:flex-row">
          <Link
            href="/size-guide"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
          >
            <span>مشاهده صفحه کامل و تعاملی راهنمای سایزبندی با مانکن زنده</span>
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              بستن پنجره
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
