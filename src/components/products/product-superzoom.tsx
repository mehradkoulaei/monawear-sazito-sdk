"use client";
import { useRef, useState } from "react";
import type { ProductImage as ImageData } from "@sazito/client-sdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductImage } from "./product-image";
import { formatNumber } from "@/lib/utils";

interface Props {
  images: ImageData[];
  index: number;
  name: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Loaded on demand; drag updates the transform without rendering the product page. */
export function ProductSuperzoom({ images, index, name, onIndexChange, onClose }: Props) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        title={name}
        hideTitle
        overlayClassName="!z-[65] !bg-black/90"
        className="pdp-superzoom-dialog !z-[70] block h-[100dvh] max-h-none w-screen max-w-none overflow-hidden p-0"
      >
        <ZoomCanvas key={images[index]?.id ?? index} image={images[index]} name={name} />
        {images.length > 1 && <div className="pdp-superzoom-thumbnails no-scrollbar" role="group" aria-label="انتخاب تصویر محصول">
          {images.map((image, i) => <button type="button" key={image.id} className={i === index ? "is-active" : undefined}
            aria-label={`نمایش تصویر ${formatNumber(i + 1)}`} aria-current={i === index} onClick={() => onIndexChange(i)}>
            <ProductImage src={image.url} alt={image.alt || name} sizes="(max-width:767px) 54px, 112px" />
          </button>)}
        </div>}
      </DialogContent>
    </Dialog>
  );
}

function ZoomCanvas({ image, name }: {
  image?: ImageData; name: string;
}) {
  const [scale, setScale] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  const transform = (x: number, y: number, zoom = scale) => {
    const bounds = viewport.current?.getBoundingClientRect();
    const maxX = (bounds?.width ?? 0) * (zoom - 1) / 2;
    const maxY = (bounds?.height ?? 0) * (zoom - 1) / 2;
    pan.current = { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
    if (layer.current) layer.current.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0) scale(${zoom})`;
  };
  const changeScale = (value: number) => {
    const next = Math.max(1, Math.min(3, value));
    setScale(next);
    transform(0, 0, next);
  };

  return (
    <>
      <div className="pdp-superzoom-viewport" ref={viewport} role="button" tabIndex={0}
        aria-label={scale === 1 ? "بزرگ‌نمایی عکس؛ برای بزرگ‌نمایی کلیک کنید" : "عکس بزرگ‌شده؛ برای جابه‌جایی بکشید و برای کوچک‌نمایی کلیک کنید"}
        style={{ cursor: scale === 1 ? "zoom-in" : "grab" }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); changeScale(scale === 1 ? 2 : 1); }
          else if (event.key === "+" || event.key === "=") { event.preventDefault(); changeScale(scale + .5); }
          else if (event.key === "-") { event.preventDefault(); changeScale(scale - .5); }
          else if (event.key.startsWith("Arrow") && scale > 1) {
            event.preventDefault();
            transform(pan.current.x + (event.key === "ArrowLeft" ? 60 : event.key === "ArrowRight" ? -60 : 0), pan.current.y + (event.key === "ArrowUp" ? 60 : event.key === "ArrowDown" ? -60 : 0));
          }
        }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          dragged.current = false;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: pan.current.x, startY: pan.current.y, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.hypot(dx, dy) > 5) { start.moved = true; dragged.current = true; }
          if (scale > 1) transform(start.startX + dx, start.startY + dy);
        }}
        onPointerUp={(event) => { if (drag.current?.id === event.pointerId) drag.current = null; }}
        onPointerCancel={() => { drag.current = null; dragged.current = true; }}
        onClick={() => { if (!dragged.current) changeScale(scale === 1 ? 2 : 1); }}>
        <div ref={layer} className="pdp-superzoom-layer">
          <ProductImage src={image?.url} alt={image?.alt || name} sizes="100vw" priority />
        </div>
      </div>
    </>
  );
}
