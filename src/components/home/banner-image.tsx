/* eslint-disable @next/next/no-img-element -- Local WebP variants already provide responsive encoding. */
interface Props {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  preload?: boolean;
  className?: string;
}

/** Deliver precompressed local WebP assets with their responsive variants. */
export function BannerImage({ src, alt, sizes, priority, preload, className }: Props) {
  const portrait = src.includes("soft-edit");
  const widths = portrait ? [480, 800, 1120] : src.includes("category-") ? [320, 480, 800, 1200] : [640, 960, 1440];
  const largest = widths[widths.length - 1];
  return <img src={src} srcSet={widths.map((width) => `${src.replace(/-\d+\.webp$/, `-${width}.webp`)} ${width}w`).join(", ")}
    alt={alt} width={largest} height={portrait ? largest * 1.25 : src.includes("category-") ? largest * 2 / 3 : largest * 3 / 4}
    sizes={sizes} loading={priority || preload ? "eager" : "lazy"} fetchPriority={priority ? "high" : preload ? "low" : undefined}
    decoding="async" draggable={false} className={className ? `banner-image ${className}` : "banner-image"} />;
}
