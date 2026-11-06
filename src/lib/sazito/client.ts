import "server-only";
import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}
import {
  createSazitoClient,
  CredentialsManager,
  MemoryStorage,
  type RequestOptions,
  type SazitoClient,
  type SazitoResponse,
} from "@sazito/client-sdk";
import { serverEnv } from "@/lib/env";
import { devLog, newRequestId, safeUpstream } from "./logger";

export const NOT_CONFIGURED_MESSAGE =
  "اتصال به ساهیتو تنظیم نشده است. مقدار SAZITO_DOMAIN را در فایل .env.local وارد کنید.";

export function notConfiguredError(): { error: { type: "validation"; status: number; message: string } } {
  return { error: { type: "validation", status: 503, message: NOT_CONFIGURED_MESSAGE } };
}

export function isConfigured(): boolean {
  return serverEnv.domain.length > 0;
}

export interface FetchContext {
  label: string; // e.g. "products/list" or "rsc:products.list"
  requestId: string;
  /** Next.js data-cache revalidation in seconds for PUBLIC GET requests; false = never cache. */
  revalidate: number | false;
  onUpstreamMs?: (ms: number) => void;
}

/**
 * SDK `customFetchApi` — the supported interception hook.
 * Adds dev logging and per-request Next.js cache policy. Authenticated requests are never cached.
 */
function makeFetch(ctx: FetchContext): typeof fetch {
  return async (input, init) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const authenticated = headers.has("authorization");
    const cacheable = method === "GET" && !authenticated && ctx.revalidate !== false;
    const isIdempotent = method === "GET" || method === "HEAD";
    const maxRetries = isIdempotent ? 3 : 1;

    // Route directly via store domain (ArvanCloud) instead of sdk.sazito.com (Sotoon CDN)
    // to prevent national keyword filtering proxies (10.10.34.36) from returning 403 on lingerie words like "سوتین".
    const storeDomainUrl =
      serverEnv.domain && rawUrl.startsWith("https://sdk.sazito.com")
        ? rawUrl.replace("https://sdk.sazito.com", `https://${serverEnv.domain}`)
        : rawUrl;

    const urlsToTry = storeDomainUrl !== rawUrl ? [rawUrl, storeDomainUrl] : [rawUrl];

    let lastErr: unknown;
    for (const targetUrl of urlsToTry) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const started = performance.now();
        try {
          const res = await fetch(targetUrl, {
            ...init,
            headers,
            ...(cacheable ? { next: { revalidate: ctx.revalidate as number } } : { cache: "no-store" as const }),
          });
          const ms = Math.round(performance.now() - started);
          ctx.onUpstreamMs?.(ms);

          // If blocked by Iranian national keyword filter (403 with filtering HTML/iframe), switch to fallback URL
          if (res.status === 403 && urlsToTry.length > 1 && targetUrl !== urlsToTry[urlsToTry.length - 1]) {
            devLog(`${method.padEnd(6)} ${ctx.label.padEnd(34)} → ${safeUpstream(targetUrl)}  403 (filtered) ${ms}ms -> trying fallback`);
            break;
          }

          devLog(`${method.padEnd(6)} ${ctx.label.padEnd(34)} → ${safeUpstream(targetUrl)}  ${res.status}  ${ms}ms  rid=${ctx.requestId}`);
          return res;
        } catch (err) {
          lastErr = err;
          const ms = Math.round(performance.now() - started);
          ctx.onUpstreamMs?.(ms);
          devLog(`${method.padEnd(6)} ${ctx.label.padEnd(34)} → ${safeUpstream(targetUrl)}  FAILED (attempt ${attempt}/${maxRetries})  ${ms}ms  rid=${ctx.requestId}`);
          if (attempt === maxRetries && targetUrl !== urlsToTry[urlsToTry.length - 1]) {
            devLog(`Falling back to ${safeUpstream(urlsToTry[urlsToTry.length - 1])} due to network error`);
            break;
          }
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, attempt * 300));
          }
        }
      }
    }
    throw lastErr;
  };
}

/**
 * Builds a per-request SDK client. The SDK's own in-memory cache is disabled (Next.js caches instead),
 * and credentials live in the supplied in-memory storage (seeded from HttpOnly cookies by the caller).
 */
export function createClient(opts: { fetchCtx: FetchContext; storage?: MemoryStorage }): SazitoClient {
  const off = { enabled: false } as const;
  return createSazitoClient(
    {
      domain: serverEnv.domain,
      apiKey: serverEnv.apiKey,
      timeout: 20000,
      retry: { enabled: true, retries: 2, retryDelay: 400 },
      cache: { products: off, categories: off, cart: off, orders: off, search: off, cms: off, tags: off, entityRoutes: off },
      customFetchApi: makeFetch(opts.fetchCtx),
      debug: false,
    },
    new CredentialsManager(opts.storage ?? new MemoryStorage()),
  );
}

type Fn<T> = (client: SazitoClient, options: RequestOptions) => Promise<SazitoResponse<T>>;

/**
 * Server-component data access (no HTTP hop, not browser-initiated). Public data only.
 * Returns the SDK `{ data } | { error }` contract; never fabricates data.
 */
export async function callPublic<T>(
  label: string,
  fn: Fn<T>,
  revalidate: number | false = 120,
): Promise<SazitoResponse<T>> {
  if (!isConfigured()) return notConfiguredError() as SazitoResponse<T>;
  const client = createClient({ fetchCtx: { label: `rsc:${label}`, requestId: newRequestId(), revalidate } });
  try {
    return await fn(client, { headers: {} });
  } catch (e) {
    return { error: { type: "network", message: e instanceof Error ? e.message : "خطای ناشناخته" } };
  }
}

/** Server-component access for authenticated data (JWT from the HttpOnly cookie). Never cached. */
export async function callAuthed<T>(label: string, jwt: string, fn: Fn<T>): Promise<SazitoResponse<T>> {
  if (!isConfigured()) return notConfiguredError() as SazitoResponse<T>;
  const client = createClient({ fetchCtx: { label: `rsc:${label}`, requestId: newRequestId(), revalidate: false } });
  try {
    return await fn(client, { headers: { Authorization: jwt } });
  } catch (e) {
    return { error: { type: "network", message: e instanceof Error ? e.message : "خطای ناشناخته" } };
  }
}
