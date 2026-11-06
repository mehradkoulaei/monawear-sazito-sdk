"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { sazitoFetch } from "@/lib/api/client";

/** Reports page views via the dedicated visits/track route (fire-and-forget). */
export function VisitTracker() {
  const path = usePathname();
  const last = React.useRef("");
  React.useEffect(() => {
    if (last.current === path) return;
    last.current = path;
    void sazitoFetch("visits/track", { body: {} });
  }, [path]);
  return null;
}
