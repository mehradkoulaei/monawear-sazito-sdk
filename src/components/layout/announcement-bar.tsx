"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const links = ["/search", "/size-guide", "/search?sort=newest"];

export function AnnouncementBar() {
  const [slide, setSlide] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null });
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!motion.matches && !document.hidden);
    update();
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || hovered || focused) return;
    const timer = window.setInterval(() => {
      setSlide(({ index }) => ({ previous: index, index: (index + 1) % links.length }));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [enabled, hovered, focused]);

  return (
    <div className="bg-burgundy text-white" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="container announcement-window" aria-live="off">
        {slide.previous !== null && <span key={`previous-${slide.previous}`} className="announcement-message announcement-outgoing" aria-hidden="true">{siteConfig.announcements[slide.previous]}</span>}
        <Link key={slide.index} href={links[slide.index]} className={`announcement-message${slide.previous !== null ? " announcement-incoming" : ""}`}>{siteConfig.announcements[slide.index]}</Link>
      </div>
    </div>
  );
}
