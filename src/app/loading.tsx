import { ProductGridSkeleton } from "@/components/products/product-grid";
export default function Loading() {
  return <div className="container py-10"><div className="mb-8 h-8 w-48 animate-pulse bg-muted" /><ProductGridSkeleton /></div>;
}
