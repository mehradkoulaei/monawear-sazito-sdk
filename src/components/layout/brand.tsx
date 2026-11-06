import { cn } from "@/lib/utils";

/** Exact typographic wordmark recovered from v2's storefront.tsx and globals.css. */
export function Brand({ className }: { className?: string }) {
  return <span className={cn("wordmark", className)} dir="ltr"><span>MONA</span><small>WEAR YOUR OWN BEAUTY</small></span>;
}
