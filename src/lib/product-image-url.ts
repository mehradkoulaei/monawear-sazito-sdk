/** Only store photography on Sazito's verified image CDN enters the watermark pipeline. */
export const PRODUCT_IMAGE_WIDTHS = [64, 96, 160, 256, 384, 640, 768, 960, 1200, 1440] as const;
export function isProductImage(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "oss.sazito.com" && !url.port && !url.username && !url.password && url.pathname.startsWith("/apiuploads/mehrsaa/uploads/image/") && /\.(jpe?g|png|webp|avif)$/i.test(url.pathname) && !url.search && !url.hash;
  } catch { return false; }
}
export function productImageUrl(src: string, width = 768): string {
  if (!isProductImage(src)) return src; // Local derivatives and third-party imagery are never marked twice.
  const size = PRODUCT_IMAGE_WIDTHS.find((w) => w >= width) ?? 1440;
  return `/api/media/product?src=${encodeURIComponent(src)}&w=${size}&v=2`;
}
