"use client";

import { useEffect, useRef, useState, useCallback, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, X, RotateCcw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import { STORY_STORAGE_KEY } from "./story-rail";

const SLIDES = [
  "/images/size-story/slide-1.webp",
  "/images/size-story/slide-2.webp",
  "/images/size-story/slide-3.webp",
  "/images/size-story/slide-4.webp",
  "/images/size-story/slide-5.webp",
];

const DESCRIPTIONS = [
  "روش اندازه‌گیری دور سینه، کمر و باسن با متر خیاطی؛ متر را صاف و بدون فشار نگه دارید.",
  "جدول اندازه‌های سایز ۳۶ تا ۵۰ مونا؛ اندازه‌های خود را با جدول و اطلاعات همان محصول مقایسه کنید.",
  "راهنمای فری سایز، L، XL و بیگ سایز؛ فیت هر مدل ممکن است متفاوت باشد، توضیحات همان محصول را بررسی کنید.",
  "راهنمای انتخاب بین دو سایز و تفاوت اندازهٔ بالاتنه و پایین‌تنه؛ پیش از خرید جدول همان مدل را بررسی کنید.",
  "چک‌لیست پیش از خرید: اندازه‌گیری بدن، مقایسه با جدول، بررسی سایز همان محصول و انتخاب بین دو سایز.",
];

const DURATION = 6000;
const VIEWED_THRESHOLD = 0.8;

interface SizeStoryProps {
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  initialIndex?: number;
  seenSlides?: boolean[];
  onSeenChange?: (seen: boolean[]) => void;
}

export function SizeStory({
  onClose,
  triggerRef,
  initialIndex = 0,
  seenSlides,
  onSeenChange,
}: SizeStoryProps) {
  const [index, setIndex] = useState(
    Math.max(0, Math.min(initialIndex, SLIDES.length - 1))
  );
  const [seen, setSeen] = useState<boolean[]>(
    seenSlides && seenSlides.length === SLIDES.length
      ? seenSlides
      : Array(SLIDES.length).fill(false)
  );
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  const [userPaused, setUserPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(false);

  const progressRef = useRef<HTMLSpanElement | null>(null);
  const elapsedRef = useRef(0);
  const markedRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const ignoreClickUntilRef = useRef<number>(0);

  const isPaused = userPaused || holding || hidden || !loaded || failed;

  const markViewed = useCallback(
    (slideIdx: number) => {
      setSeen((prev) => {
        if (prev[slideIdx]) return prev;
        const next = [...prev];
        next[slideIdx] = true;
        try {
          localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* Storage is optional */
        }
        onSeenChange?.(next);
        return next;
      });
    },
    [onSeenChange]
  );

  const nextSlide = useCallback(() => {
    if (index < SLIDES.length - 1) {
      setLoaded(false);
      setFailed(false);
      setIndex((prev) => prev + 1);
    }
  }, [index]);

  const prevSlide = useCallback(() => {
    if (index > 0) {
      setLoaded(false);
      setFailed(false);
      setIndex((prev) => prev - 1);
    }
  }, [index]);

  const goToSlide = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= SLIDES.length) return;
    setLoaded(false);
    setFailed(false);
    setIndex(targetIndex);
  }, []);

  // Sync visibility and prefers-reduced-motion
  useEffect(() => {
    const handleVisibility = () => {
      setHidden(document.hidden);
      if (document.hidden) {
        setHolding(false);
      }
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setUserPaused(true);
    }
    const handleMotion = (e: MediaQueryListEvent) => {
      if (e.matches) setUserPaused(true);
    };
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  // Preload next slide
  useEffect(() => {
    if (index + 1 < SLIDES.length) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = SLIDES[index + 1];
    }
  }, [index]);

  // Reset timer on slide change
  useEffect(() => {
    elapsedRef.current = 0;
    markedRef.current = false;
    lastTimeRef.current = performance.now();
    if (progressRef.current) {
      progressRef.current.style.transform = "scaleX(0)";
    }
  }, [index]);

  // Unified timer loop
  useEffect(() => {
    if (isPaused) {
      lastTimeRef.current = performance.now();
      return;
    }

    let frame = 0;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      elapsedRef.current += delta;

      const fraction = Math.min(1, elapsedRef.current / DURATION);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${fraction})`;
      }

      if (fraction >= VIEWED_THRESHOLD && !markedRef.current) {
        markedRef.current = true;
        markViewed(index);
      }

      if (fraction >= 1) {
        markViewed(index);
        if (index < SLIDES.length - 1) {
          setLoaded(false);
          setFailed(false);
          setIndex((prev) => prev + 1);
        } else {
          setUserPaused(true);
        }
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, isPaused, markViewed]);

  // Gesture handlers: Touch
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    };
    setHolding(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setHolding(false);
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = e.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const isHorizontalSwipe = Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy);

    if (isHorizontalSwipe) {
      ignoreClickUntilRef.current = performance.now() + 400;
      // RTL: Swipe Left (dx < 0) => Next slide; Swipe Right (dx > 0) => Prev slide
      if (dx < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    setHolding(false);
  };

  // Gesture handlers: Mouse Press & Hold
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    setHolding(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    setHolding(false);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    setHolding(false);
  };

  const label = DESCRIPTIONS[index];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        title="استوری راهنمای سایز"
        hideTitle
        className="mona-size-story"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") setUserPaused(true);
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nextSlide();
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            prevSlide();
          }
          if (event.key === " ") {
            event.preventDefault();
            setUserPaused((prev) => !prev);
          }
        }}
      >
        <div className="mona-story-stage">
          {/* Desktop navigation: Previous (Right side in RTL) */}
          <button
            type="button"
            disabled={index === 0}
            onClick={prevSlide}
            className="mona-story-nav-btn mona-story-nav-prev"
            aria-label="استوری قبلی"
          >
            <ChevronRight size={26} />
          </button>

          {/* Main Card */}
          <div className="mona-story-card">
            {/* Media Area */}
            <div
              className="mona-story-media"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              {/* Progress Bars */}
              <div
                className="mona-story-progress-list"
                role="group"
                aria-label="بخش‌های راهنمای سایز"
              >
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="mona-story-progress-segment"
                    onClick={() => {
                      setUserPaused(true);
                      goToSlide(i);
                    }}
                    aria-label={`نمایش بخش ${formatNumber(i + 1)}${seen[i] ? "، دیده‌شده" : ""}`}
                    aria-current={index === i ? "step" : undefined}
                  >
                    <span className="mona-story-progress-track">
                      <span
                        key={`${index}-${i}`}
                        ref={index === i ? progressRef : undefined}
                        className="mona-story-progress-fill"
                        style={{
                          transform: i < index ? "scaleX(1)" : "scaleX(0)",
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {/* Header */}
              <div className="mona-story-header">
                <div className="mona-story-profile">
                  <Image
                    src="/images/size-story/cover.webp"
                    alt=""
                    width={36}
                    height={36}
                    className="mona-story-avatar"
                  />
                  <div>
                    <strong className="mona-story-head-title">راهنمای سایز 🤎</strong>
                    <p className="caption-5 mona-story-head-sub" aria-live="polite">
                      بخش {formatNumber(index + 1)} از {formatNumber(SLIDES.length)}
                    </p>
                  </div>
                </div>

                <div className="mona-story-controls">
                  <button
                    type="button"
                    className="mona-story-play-btn"
                    onClick={() => setUserPaused(!userPaused)}
                    aria-label={userPaused ? "پخش استوری" : "توقف استوری"}
                    title={userPaused ? "پخش استوری" : "توقف استوری"}
                  >
                    {userPaused ? <Play size={17} /> : <Pause size={17} />}
                  </button>

                  <button
                    type="button"
                    className="mona-story-close-btn"
                    onClick={onClose}
                    aria-label="بستن استوری"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Shading gradients for legibility */}
              <div className="mona-story-shade" aria-hidden="true" />

              {/* Slide Image */}
              {!loaded && !failed && (
                <div
                  className="mona-story-skeleton"
                  aria-label="در حال بارگذاری تصویر"
                  role="status"
                />
              )}

              {!failed && (
                <Image
                  key={`${index}-${retry}`}
                  src={SLIDES[index]}
                  alt={label}
                  fill
                  unoptimized
                  sizes="(max-width: 560px) 100vw, 430px"
                  draggable={false}
                  className={`mona-story-img ${loaded ? "is-loaded" : ""}`}
                  onLoad={() => setLoaded(true)}
                  onError={() => {
                    setFailed(true);
                    setLoaded(false);
                  }}
                  priority
                />
              )}

              {failed && (
                <div className="mona-story-image-error">
                  <p className="body-5 text-white">تصویر بارگذاری نشد.</p>
                  <button
                    type="button"
                    className="mona-story-retry-btn"
                    onClick={() => {
                      setFailed(false);
                      setRetry((r) => r + 1);
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>تلاش دوباره</span>
                  </button>
                </div>
              )}

              {/* Invisible Tap Zones: RTL (Left = Next, Right = Prev) */}
              {index < SLIDES.length - 1 && (
                <div
                  className="mona-story-zone mona-story-zone-next"
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (performance.now() < ignoreClickUntilRef.current) return;
                    nextSlide();
                  }}
                />
              )}

              {index > 0 && (
                <div
                  className="mona-story-zone mona-story-zone-prev"
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (performance.now() < ignoreClickUntilRef.current) return;
                    prevSlide();
                  }}
                />
              )}
            </div>

            {/* Footer CTA */}
            <div className="mona-story-footer">
              <Link
                href="/size-guide"
                onClick={onClose}
                className="mona-story-cta"
                aria-label="مشاهده راهنمای کامل سایزبندی و انتخاب سایز"
              >
                مشاهده راهنمای سایزبندی و انتخاب سایز 📏
              </Link>
            </div>
          </div>

          {/* Desktop navigation: Next (Left side in RTL) */}
          <button
            type="button"
            disabled={index === SLIDES.length - 1}
            onClick={nextSlide}
            className="mona-story-nav-btn mona-story-nav-next"
            aria-label="استوری بعدی"
          >
            <ChevronLeft size={26} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
