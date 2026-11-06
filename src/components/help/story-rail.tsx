"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const SizeStory = dynamic(() => import("./size-story").then((module) => module.SizeStory));

export const STORY_STORAGE_KEY = "mw-size-guide-story-progress-v4";
const LEGACY_STORAGE_KEY = "mona-size-story-seen-v1";
const TOTAL_SLIDES = 5;
const CIRCUMFERENCE = 150.79644737231007; // 2 * Math.PI * 24

export function StoryRail() {
  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(Array(TOTAL_SLIDES).fill(false));
  const trigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      let stored: unknown = JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) || "null");
      if (!stored) {
        stored = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
      }
      if (Array.isArray(stored) && stored.length === TOTAL_SLIDES && stored.every((value) => typeof value === "boolean")) {
        setSeen(stored);
      }
    } catch {
      /* Viewing remains available without storage. */
    }
  }, []);

  const viewedCount = seen.filter(Boolean).length;
  const isComplete = viewedCount >= TOTAL_SLIDES;
  const isPartial = viewedCount > 0 && viewedCount < TOTAL_SLIDES;
  const progressOffset = CIRCUMFERENCE * (1 - viewedCount / TOTAL_SLIDES);

  const handleOpen = () => {
    const firstUnviewed = seen.findIndex((v) => !v);
    const initial = firstUnviewed >= 0 ? firstUnviewed : 0;
    setStartIndex(initial);
    setIsOpen(true);
  };

  return (
    <section className="container mona-story-rail" aria-label="استوری‌های راهنمای سایز مونا">
      <ul className="no-scrollbar">
        <li>
          <button
            ref={trigger}
            type="button"
            className={`mona-story-bubble ${isComplete ? "is-complete" : isPartial ? "is-partial" : ""}`}
            data-viewed={viewedCount}
            aria-label={`استوری راهنمای سایز 🤎${isComplete ? "، همه بخش‌ها دیده‌شده؛ مشاهده مجدد" : viewedCount > 0 ? `، ${viewedCount} از ${TOTAL_SLIDES} بخش دیده‌شده` : "، دیده‌نشده"}`}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={handleOpen}
          >
            <span className="mona-story-ring-wrap">
              <svg viewBox="0 0 54 54" className="mona-story-ring-svg" aria-hidden="true">
                <circle cx="27" cy="27" r="24" className="mona-story-ring-track" />
                <circle
                  cx="27"
                  cy="27"
                  r="24"
                  className="mona-story-thumb-progress"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: isPartial ? progressOffset : CIRCUMFERENCE,
                  }}
                />
              </svg>
              <span className="mona-story-thumb-img-wrap">
                <Image
                  src="/images/size-story/cover.webp"
                  alt=""
                  width={68}
                  height={68}
                  className="mona-story-thumb-image"
                  priority
                />
              </span>
            </span>
            <span className="caption-4 mona-story-label">راهنمای سایز 🤎</span>
          </button>
        </li>
      </ul>
      {isOpen && (
        <SizeStory
          initialIndex={startIndex}
          seenSlides={seen}
          onSeenChange={setSeen}
          triggerRef={trigger}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  );
}
