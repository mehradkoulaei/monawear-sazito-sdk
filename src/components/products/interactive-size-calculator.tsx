"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { Ruler, Sparkles, CheckCircle2, Info, ChevronLeft, ArrowRight, HelpCircle } from "lucide-react";
import { toFaDigits } from "@/lib/utils";

export interface SizeResult {
  euSize: number;
  letterSize: string;
  braCup: string;
  fitAdvice: string;
  badge: string;
}

// Data from Mona Wear's official measurements
export function calculateSize(bust: number, waist: number, hip: number): SizeResult {
  // Determine EU size based on ranges
  const getBustSize = (b: number) => {
    if (b <= 88) return 36;
    if (b <= 92) return 38;
    if (b <= 96) return 40;
    if (b <= 100) return 42;
    if (b <= 104) return 44;
    if (b <= 108) return 46;
    if (b <= 112) return 48;
    return 50;
  };

  const getWaistSize = (w: number) => {
    if (w <= 68) return 36;
    if (w <= 72) return 38;
    if (w <= 76) return 40;
    if (w <= 80) return 42;
    if (w <= 84) return 44;
    if (w <= 88) return 46;
    if (w <= 92) return 48;
    return 50;
  };

  const getHipSize = (h: number) => {
    if (h <= 94) return 36;
    if (h <= 98) return 38;
    if (h <= 102) return 40;
    if (h <= 106) return 42;
    if (h <= 110) return 44;
    if (h <= 114) return 46;
    if (h <= 118) return 48;
    return 50;
  };

  const bSize = getBustSize(bust);
  const wSize = getWaistSize(waist);
  const hSize = getHipSize(hip);

  // In lingerie & loungewear, prioritize the largest dimension for comfortable fit
  const euSize = Math.max(bSize, wSize, hSize);

  let letterSize = "فری سایز (Free Size)";
  let braCup = "۷۰ تا ۸۰";
  let badge = "فری سایز";

  if (euSize <= 36) {
    letterSize = "S (سایز ۳۶)";
    braCup = "۷۰ تا ۷۵";
    badge = "سایز S";
  } else if (euSize <= 40) {
    letterSize = "L / فری سایز (مناسب ۳۸ تا ۴۰)";
    braCup = "۷۰ تا ۸۰";
    badge = "سایز L";
  } else if (euSize <= 44) {
    letterSize = "XL (مناسب ۴۲ تا ۴۴)";
    braCup = "۸۰ تا ۸۵";
    badge = "سایز XL";
  } else {
    letterSize = "۲XL / بیگ سایز (مناسب ۴۶ تا ۵۰)";
    braCup = "۸۰ تا ۹۰";
    badge = "بیگ سایز";
  }

  let fitAdvice = "اندازه‌های شما کاملاً متناسب است. مدل‌های فری سایز و L تن‌خور بسیار شیک و راحتی روی اندام شما خواهند داشت.";
  if (hSize > bSize + 2) {
    fitAdvice = "با توجه به برجستگی دور باسن نسبت به بالاتنه، در مدل‌های دو تکه یا شلوارک‌دار انتخاب سایز بر اساس باسن توصیه می‌شود.";
  } else if (bSize > hSize + 2) {
    fitAdvice = "به دلیل تفاوت سایز سینه، در مدل‌های بادی یا کاپ‌دار انتخاب سایز بزرگ‌تر برای راحتی بیشتر سینه پیشنهاد می‌شود.";
  } else if (euSize >= 44) {
    fitAdvice = "برای راحتی حداکثری و افتادگی طبیعی پارچه ساتن و حریر، مدل‌های بیگ سایز و قواره‌دار مونا انتخابی ایده‌آل هستند.";
  }

  return { euSize, letterSize, braCup, fitAdvice, badge };
}

export interface SizeChartRow {
  eu: number;
  label: string;
  bust: string;
  waist: string;
  hip: string;
  bra: string;
}

export const MONA_SIZE_CHART: SizeChartRow[] = [
  { eu: 36, label: "سایز S", bust: "۸۴ تا ۸۸", waist: "۶۴ تا ۶۸", hip: "۹۰ تا ۹۴", bra: "۷۰" },
  { eu: 38, label: "L / فری سایز", bust: "۸۸ تا ۹۲", waist: "۶۸ تا ۷۲", hip: "۹۴ تا ۹۸", bra: "۷۰ تا ۷۵" },
  { eu: 40, label: "L / فری سایز", bust: "۹۲ تا ۹۶", waist: "۷۲ تا ۷۶", hip: "۹۸ تا ۱۰۲", bra: "۷۵ تا ۸۰" },
  { eu: 42, label: "XL / فری سایز", bust: "۹۶ تا ۱۰۰", waist: "۷۶ تا ۸۰", hip: "۱۰۲ تا ۱۰۶", bra: "۸۰" },
  { eu: 44, label: "سایز XL", bust: "۱۰۰ تا ۱۰۴", waist: "۸۰ تا ۸۴", hip: "۱۰۶ تا ۱۱۰", bra: "۸۰ تا ۸۵" },
  { eu: 46, label: "بیگ سایز (2XL)", bust: "۱۰۴ تا ۱۰۸", waist: "۸۴ تا ۸۸", hip: "۱۱۰ تا ۱۱۴", bra: "۸۵" },
  { eu: 48, label: "بیگ سایز (2XL)", bust: "۱۰۸ تا ۱۱۲", waist: "۸۸ تا ۹۲", hip: "۱۱۴ تا ۱۱۸", bra: "۸۵ تا ۹۰" },
  { eu: 50, label: "بیگ سایز (3XL)", bust: "۱۱۲ تا ۱۱۶", waist: "۹۲ تا ۹۶", hip: "۱۱۸ تا ۱۲۲", bra: "۹۰" },
];

export function InteractiveSizeCalculator() {
  const [bust, setBust] = useState<number>(92);
  const [waist, setWaist] = useState<number>(72);
  const [hip, setHip] = useState<number>(98);
  const [activeZone, setActiveZone] = useState<"bust" | "waist" | "hip" | null>(null);

  const result = calculateSize(bust, waist, hip);

  // Quick preset sizes
  const applyPreset = (b: number, w: number, h: number) => {
    setBust(b);
    setWaist(w);
    setHip(h);
  };

  return (
    <div className="space-y-16">
      {/* Top Interactive Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-burgundy/15 bg-card/60 p-5 shadow-xs backdrop-blur-xs md:p-8">
        <div className="mb-8 text-center sm:text-start">
          <div className="inline-flex items-center gap-2 rounded-full bg-burgundy/10 px-3 py-1 text-xs font-semibold text-burgundy">
            <Sparkles className="h-3.5 w-3.5" />
            <span>محاسبه‌گر هوشمند اندازه و سایز</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            سایز اختصاصی خود را پیدا کنید
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            اندازه‌های تقریبی یا دقیق دور سینه، کمر و باسن خود را وارد کنید؛ مانکن روبه‌رو به‌صورت زنده مقادیر را نشان می‌دهد و مناسب‌ترین سایز را به شما پیشنهاد می‌کند.
          </p>
        </div>

        {/* 2-Column Layout: Right = Inputs & Announcement, Left = Silhouette Mannequin */}
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          
          {/* Right Column: Inputs & Calculated Result (In RTL this is the first column) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Quick Presets */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                انتخاب سریع بر اساس سایز معمول:
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
                    className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-burgundy hover:bg-burgundy/5"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 1: Bust */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                activeZone === "bust"
                  ? "border-burgundy bg-burgundy/5 shadow-xs"
                  : "border-border/80 bg-background hover:border-border"
              }`}
              onMouseEnter={() => setActiveZone("bust")}
              onMouseLeave={() => setActiveZone(null)}
              onFocus={() => setActiveZone("bust")}
              onBlur={() => setActiveZone(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">۱. دور سینه (Bust)</span>
                  <span className="block text-xs text-muted-foreground">متر روی برجسته‌ترین بخش سینه، موازی با زمین</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min={65}
                    max={135}
                    value={bust}
                    onChange={(e) => setBust(Number(e.target.value) || 0)}
                    className="w-16 rounded-md border border-input bg-card px-2 py-1 text-center font-bold text-foreground focus:border-burgundy focus:outline-hidden"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </div>
              <input
                type="range"
                min={65}
                max={135}
                value={bust}
                onChange={(e) => setBust(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>۶۵ cm</span>
                <span className="font-medium text-burgundy">{toFaDigits(bust)} سانتی‌متر</span>
                <span>۱۳۵ cm</span>
              </div>
            </div>

            {/* Input 2: Waist */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                activeZone === "waist"
                  ? "border-burgundy bg-burgundy/5 shadow-xs"
                  : "border-border/80 bg-background hover:border-border"
              }`}
              onMouseEnter={() => setActiveZone("waist")}
              onMouseLeave={() => setActiveZone(null)}
              onFocus={() => setActiveZone("waist")}
              onBlur={() => setActiveZone(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">۲. دور کمر (Waist)</span>
                  <span className="block text-xs text-muted-foreground">باریک‌ترین بخش بالاتنه (کمی بالاتر از ناف)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min={50}
                    max={125}
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value) || 0)}
                    className="w-16 rounded-md border border-input bg-card px-2 py-1 text-center font-bold text-foreground focus:border-burgundy focus:outline-hidden"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </div>
              <input
                type="range"
                min={50}
                max={125}
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>۵۰ cm</span>
                <span className="font-medium text-burgundy">{toFaDigits(waist)} سانتی‌متر</span>
                <span>۱۲۵ cm</span>
              </div>
            </div>

            {/* Input 3: Hip */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                activeZone === "hip"
                  ? "border-burgundy bg-burgundy/5 shadow-xs"
                  : "border-border/80 bg-background hover:border-border"
              }`}
              onMouseEnter={() => setActiveZone("hip")}
              onMouseLeave={() => setActiveZone(null)}
              onFocus={() => setActiveZone("hip")}
              onBlur={() => setActiveZone(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">۳. دور باسن (Hip)</span>
                  <span className="block text-xs text-muted-foreground">برجسته‌ترین قسمت باسن در حالت ایستاده</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min={70}
                    max={145}
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value) || 0)}
                    className="w-16 rounded-md border border-input bg-card px-2 py-1 text-center font-bold text-foreground focus:border-burgundy focus:outline-hidden"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </div>
              <input
                type="range"
                min={70}
                max={145}
                value={hip}
                onChange={(e) => setHip(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-burgundy"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>۷۰ cm</span>
                <span className="font-medium text-burgundy">{toFaDigits(hip)} سانتی‌متر</span>
                <span>۱۴۵ cm</span>
              </div>
            </div>

            {/* Calculated Result Announcement Card */}
            <div className="rounded-xl border border-burgundy/25 bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-burgundy" />
                    <span className="text-xs font-semibold text-burgundy">سایز پیشنهادی برای شما</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-foreground sm:text-3xl">
                      {result.letterSize}
                    </span>
                    <span className="rounded-md bg-burgundy/10 px-2 py-0.5 text-xs font-bold text-burgundy">
                      EU {toFaDigits(result.euSize)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground text-pretty">
                    مناسب کاپ سوتین: <strong className="text-foreground">{toFaDigits(result.braCup)}</strong>
                  </p>
                </div>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-burgundy/90 active:scale-[0.98]"
                >
                  <span>مشاهده محصولات مونا</span>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 border-t border-border/80 pt-3">
                <p className="text-xs leading-6 text-foreground/80 text-pretty">
                  <span className="font-semibold text-burgundy">💡 توصیه تن‌خور: </span>
                  {result.fitAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Left Column: Interactive Silhouette Mannequin with Callout Indicators */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-6 lg:col-span-5">
            <span className="mb-3 text-xs font-medium text-muted-foreground">
              نمایش زنده اندازه‌ها روی اندام مانکن
            </span>

            <div className="relative flex w-full max-w-[280px] justify-center py-2">
              {/* The Silhouette SVG Mannequin - Anatomically Natural & Refined Proportions */}
              <svg
                viewBox="0 0 320 540"
                className="h-auto w-full select-none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="مانکن راهنمای اندازه‌گیری با تناسب طبیعی"
              >
                <defs>
                  {/* Subtle luxurious body fill gradient */}
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7A2838" stopOpacity="0.04" />
                    <stop offset="50%" stopColor="#C9A57B" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#7A2838" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {/* Refined Natural Female Silhouette Contour (No exaggerated hourglass, natural bust & waist) */}
                <path
                  d="
                    M 160 34
                    C 172 34, 180 42, 180 54
                    C 180 66, 174 76, 169 82
                    C 167 86, 169 92, 172 98
                    C 180 100, 194 106, 206 114
                    C 211 118, 213 126, 209 134
                    C 205 140, 199 144, 197 150
                    C 196 156, 197 162, 197 170
                    C 197 185, 193 206, 188 226
                    C 186 240, 189 258, 194 274
                    C 198 285, 202 292, 202 298
                    C 202 314, 199 334, 196 355
                    C 193 380, 189 405, 187 422
                    C 186 436, 189 450, 189 465
                    C 189 482, 183 502, 179 516
                    L 174 520
                    L 169 520
                    C 170 502, 171 478, 170 452
                    C 169 430, 168 402, 167 375
                    C 166 358, 164 348, 160 340
                    C 156 348, 154 358, 153 375
                    C 152 402, 151 430, 150 452
                    C 149 478, 150 502, 151 520
                    L 146 520
                    L 141 516
                    C 137 502, 131 482, 131 465
                    C 131 450, 134 436, 133 422
                    C 131 405, 127 380, 124 355
                    C 121 334, 118 314, 118 298
                    C 118 292, 122 285, 126 274
                    C 131 258, 134 240, 132 226
                    C 127 206, 123 185, 123 170
                    C 123 162, 124 156, 123 150
                    C 121 144, 115 140, 111 134
                    C 107 126, 109 118, 114 114
                    C 126 106, 140 100, 148 98
                    C 151 92, 153 86, 151 82
                    C 146 76, 140 66, 140 54
                    C 140 42, 148 34, 160 34
                    Z
                  "
                  fill="url(#bodyGrad)"
                  stroke={activeZone ? "#7A2838" : "rgba(122, 40, 56, 0.45)"}
                  strokeWidth={activeZone ? "1.8" : "1.4"}
                  strokeLinejoin="round"
                  className="transition-colors duration-300"
                />

                {/* Subtle Anatomical Collarbone (Clavicle) */}
                <path
                  d="M 148 104 Q 155 108 160 106 Q 165 108 172 104"
                  fill="none"
                  stroke="#7A2838"
                  strokeOpacity="0.22"
                  strokeWidth="1"
                  strokeLinecap="round"
                />

                {/* Subtle center balance guideline */}
                <line
                  x1="160"
                  y1="110"
                  x2="160"
                  y2="335"
                  stroke="#7A2838"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />

                {/* --- 1. BUST LEVEL (y = 168) --- */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveZone(activeZone === "bust" ? null : "bust")}
                >
                  {/* Subtle glowing halo when active */}
                  {activeZone === "bust" && (
                    <ellipse cx="160" cy="168" rx="42" ry="10" fill="#7A2838" fillOpacity="0.12" />
                  )}
                  {/* Measurement line */}
                  <line
                    x1="123"
                    y1="168"
                    x2="197"
                    y2="168"
                    stroke="#7A2838"
                    strokeWidth={activeZone === "bust" ? "2.5" : "1.5"}
                    strokeDasharray={activeZone === "bust" ? "none" : "3,3"}
                    className="transition-all"
                  />
                  {/* End anchor dots */}
                  <circle cx="123" cy="168" r={activeZone === "bust" ? 4.5 : 3} fill="#7A2838" />
                  <circle cx="197" cy="168" r={activeZone === "bust" ? 4.5 : 3} fill="#7A2838" />
                </g>

                {/* --- 2. WAIST LEVEL (y = 226) --- */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveZone(activeZone === "waist" ? null : "waist")}
                >
                  {/* Subtle glowing halo when active */}
                  {activeZone === "waist" && (
                    <ellipse cx="160" cy="226" rx="32" ry="8" fill="#7A2838" fillOpacity="0.12" />
                  )}
                  {/* Measurement line */}
                  <line
                    x1="132"
                    y1="226"
                    x2="188"
                    y2="226"
                    stroke="#7A2838"
                    strokeWidth={activeZone === "waist" ? "2.5" : "1.5"}
                    strokeDasharray={activeZone === "waist" ? "none" : "3,3"}
                    className="transition-all"
                  />
                  {/* End anchor dots */}
                  <circle cx="132" cy="226" r={activeZone === "waist" ? 4.5 : 3} fill="#7A2838" />
                  <circle cx="188" cy="226" r={activeZone === "waist" ? 4.5 : 3} fill="#7A2838" />
                </g>

                {/* --- 3. HIP LEVEL (y = 298) --- */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveZone(activeZone === "hip" ? null : "hip")}
                >
                  {/* Subtle glowing halo when active */}
                  {activeZone === "hip" && (
                    <ellipse cx="160" cy="298" rx="46" ry="11" fill="#7A2838" fillOpacity="0.12" />
                  )}
                  {/* Measurement line */}
                  <line
                    x1="118"
                    y1="298"
                    x2="202"
                    y2="298"
                    stroke="#7A2838"
                    strokeWidth={activeZone === "hip" ? "2.5" : "1.5"}
                    strokeDasharray={activeZone === "hip" ? "none" : "3,3"}
                    className="transition-all"
                  />
                  {/* End anchor dots */}
                  <circle cx="118" cy="298" r={activeZone === "hip" ? 4.5 : 3} fill="#7A2838" />
                  <circle cx="202" cy="298" r={activeZone === "hip" ? 4.5 : 3} fill="#7A2838" />
                </g>
              </svg>

              {/* Floating Real-time Callout Badges around the Silhouette */}
              
              {/* Bust Badge (Top level, right side of mannequin at y=168, ~31%) */}
              <div
                className={`absolute end-[-10px] top-[31%] -translate-y-1/2 cursor-pointer transition-all duration-200 sm:end-[-16px] ${
                  activeZone === "bust" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
                onClick={() => setActiveZone("bust")}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs shadow-xs backdrop-blur-xs transition-colors ${
                    activeZone === "bust"
                      ? "border-burgundy bg-burgundy text-white shadow-md"
                      : "border-border bg-card/90 text-foreground"
                  }`}
                >
                  <span className="font-medium text-[11px]">سینه:</span>
                  <span className="font-bold">{toFaDigits(bust)}</span>
                  <span className="text-[10px] opacity-80">cm</span>
                </div>
              </div>

              {/* Waist Badge (Middle level, left side of mannequin at y=226, ~42%) */}
              <div
                className={`absolute start-[-10px] top-[42%] -translate-y-1/2 cursor-pointer transition-all duration-200 sm:start-[-16px] ${
                  activeZone === "waist" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
                onClick={() => setActiveZone("waist")}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs shadow-xs backdrop-blur-xs transition-colors ${
                    activeZone === "waist"
                      ? "border-burgundy bg-burgundy text-white shadow-md"
                      : "border-border bg-card/90 text-foreground"
                  }`}
                >
                  <span className="font-medium text-[11px]">کمر:</span>
                  <span className="font-bold">{toFaDigits(waist)}</span>
                  <span className="text-[10px] opacity-80">cm</span>
                </div>
              </div>

              {/* Hip Badge (Lower level, right side of mannequin at y=298, ~55%) */}
              <div
                className={`absolute end-[-10px] top-[55%] -translate-y-1/2 cursor-pointer transition-all duration-200 sm:end-[-16px] ${
                  activeZone === "hip" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
                onClick={() => setActiveZone("hip")}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs shadow-xs backdrop-blur-xs transition-colors ${
                    activeZone === "hip"
                      ? "border-burgundy bg-burgundy text-white shadow-md"
                      : "border-border bg-card/90 text-foreground"
                  }`}
                >
                  <span className="font-medium text-[11px]">باسن:</span>
                  <span className="font-bold">{toFaDigits(hip)}</span>
                  <span className="text-[10px] opacity-80">cm</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] text-muted-foreground">
                روی هر ناحیه یا کادر کلیک کنید تا روی مانکن هایلایت شود
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Section: Professional Explanations & Measurement Guides */}
      <section className="space-y-12">
        {/* Step-by-Step 3 Cards: How to Measure Properly */}
        <div>
          <div className="mb-6 text-center">
            <span className="text-xs font-semibold text-burgundy">آموزش گام به گام</span>
            <h3 className="mt-1 text-xl font-bold text-foreground text-balance sm:text-2xl">
              چطور اندازه‌های بدن خود را دقیق بگیریم؟
            </h3>
            <p className="mt-2 text-xs text-muted-foreground text-pretty">
              با استفاده از یک متر خیاطی ساده، در کمتر از دو دقیقه اندازه‌های دقیق خود را یادداشت کنید.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Bust */}
            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy font-bold">
                ۱
              </div>
              <h4 className="text-sm font-bold text-foreground text-balance">اندازه‌گیری دور سینه</h4>
              <p className="mt-2 text-xs leading-6 text-muted-foreground text-pretty">
                متر خیاطی را دور برجسته‌ترین قسمت سینه قرار دهید. دقت کنید متر در پشت کاملاً صاف و موازی زمین باشد و سفت یا خیلی شل کشیده نشود.
              </p>
            </div>

            {/* Card 2: Waist */}
            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy font-bold">
                ۲
              </div>
              <h4 className="text-sm font-bold text-foreground text-balance">اندازه‌گیری دور کمر</h4>
              <p className="mt-2 text-xs leading-6 text-muted-foreground text-pretty">
                باریک‌ترین بخش تنه (حدود ۲ تا ۳ سانتی‌متر بالاتر از ناف) را در حالت ایستاده و بازدم طبیعی بدون حبس کردن نفس اندازه بگیرید.
              </p>
            </div>

            {/* Card 3: Hip */}
            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy font-bold">
                ۳
              </div>
              <h4 className="text-sm font-bold text-foreground text-balance">اندازه‌گیری دور باسن</h4>
              <p className="mt-2 text-xs leading-6 text-muted-foreground text-pretty">
                پاها را کنار هم جفت کنید و متر را دور برجسته‌ترین و پهن‌ترین قسمت باسن قرار دهید تا عدد واقعی پایین‌تنه به دست آید.
              </p>
            </div>
          </div>
        </div>

        {/* Master Comparison Table: Size conversion table */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-foreground text-balance">جدول جامع استانداردهای سایزبندی مونا</h3>
              <p className="text-xs text-muted-foreground text-pretty">مقایسه سایز اروپایی (EU) با سایزهای حروفی، دور سینه، کمر و باسن</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-burgundy font-medium">
              <Ruler className="h-3.5 w-3.5" />
              <span>اعداد بر حسب سانتی‌متر</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/40 text-foreground">
                  <th className="py-3 px-3 font-semibold">سایز EU</th>
                  <th className="py-3 px-3 font-semibold">عنوان در مونا</th>
                  <th className="py-3 px-3 font-semibold">مناسب دور سینه</th>
                  <th className="py-3 px-3 font-semibold">مناسب دور کمر</th>
                  <th className="py-3 px-3 font-semibold">مناسب دور باسن</th>
                  <th className="py-3 px-3 font-semibold">سایز سوتین پیشنهادی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MONA_SIZE_CHART.map((row) => (
                  <tr
                    key={row.eu}
                    className={`transition-colors hover:bg-secondary/30 ${
                      row.eu === result.euSize ? "bg-burgundy/10 font-bold text-burgundy" : "text-muted-foreground"
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-foreground">EU {toFaDigits(row.eu)}</td>
                    <td className="py-3 px-3">{row.label}</td>
                    <td className="py-3 px-3">{row.bust} cm</td>
                    <td className="py-3 px-3">{row.waist} cm</td>
                    <td className="py-3 px-3">{row.hip} cm</td>
                    <td className="py-3 px-3 font-medium text-foreground">{toFaDigits(row.bra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pro Tip Callout Card: Between Two Sizes */}
        <div className="rounded-xl border border-border/80 bg-card p-5 md:p-6 shadow-xs">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground text-balance">
                اگر بین دو سایز قرار داشتید چه انتخابی مناسب‌تر است؟
              </h4>
              <p className="text-xs leading-7 text-muted-foreground text-pretty">
                در محصولات لباس خواب زنانه، ست‌های راحتی و بادی‌ها، اگر اندازه‌های شما در مرز بین دو سایز قرار می‌گیرد یا سایز بالاتنه با پایین‌تنه‌تان یکسان نیست، همیشه <strong>انتخاب سایز بزرگ‌تر</strong> گزینه بهتری است. لباس خواب کمی آزادتر هم تن‌خور راحت‌تری دارد و هم افتادگی پارچه‌های ساتن، حریر و گیپور روی بدن شیک‌تر به نظر می‌رسد.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
