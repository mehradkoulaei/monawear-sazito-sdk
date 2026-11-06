"use client";
import Image from "next/image";
import { isProductImage, productImageUrl } from "@/lib/product-image-url";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Real product image, or a neutral placeholder when Sazito returned none. */
export function ProductImage({ src, alt, sizes, className, priority }: { src?: string; alt: string; sizes: string; className?: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0 grid place-items-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="h-8 w-8" strokeWidth={1} aria-hidden />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} loader={isProductImage(src) ? ({ src, width }) => productImageUrl(src, width) : undefined} className={cn("object-contain", className)} />;
}
