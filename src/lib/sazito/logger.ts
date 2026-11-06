import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * Development-only logging. Logs METHOD, module/operation, upstream PATH (no query values),
 * status, duration and request id. Never logs headers, cookies, bodies, tokens or customer data.
 */
export function devLog(line: string) {
  if (!serverEnv.isDev) return;
  console.log(`\x1b[35m[sazito]\x1b[0m ${line}`);
}

export function safeUpstream(url: string): string {
  try {
    const u = new URL(url);
    const keys = [...u.searchParams.keys()];
    return u.pathname + (keys.length ? `?{${keys.join(",")}}` : "");
  } catch {
    return "(unparsable url)";
  }
}

export function newRequestId(): string {
  return Math.random().toString(36).slice(2, 10);
}
