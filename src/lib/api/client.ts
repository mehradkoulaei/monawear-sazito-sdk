"use client";
import { API_METHODS, type ApiRoute } from "./routes";

export interface ApiError {
  type: "network" | "api" | "validation";
  status?: number;
  message: string;
  details?: unknown;
}
export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: ApiError };

interface Options {
  /** query string for GET/DELETE */
  query?: Record<string, string | number | boolean | undefined | null | Array<string | number>>;
  /** JSON body for POST */
  body?: unknown;
  formData?: FormData;
  /** value for the dynamic segment of routes such as cms/page/[...path] or dynamic-forms/[id] */
  pathParam?: string;
  signal?: AbortSignal;
}

/**
 * The ONLY way UI code talks to Sazito. Each call is a distinct same-origin request, so it shows up under
 * Chrome DevTools → Network → Fetch/XHR as e.g.  GET /api/sazito/products/list?page=1
 */
export async function sazitoFetch<T>(route: ApiRoute, opts: Options = {}): Promise<ApiResult<T>> {
  const method = API_METHODS[route];
  let path = `/api/sazito/${route}`;
  if (path.includes("[")) {
    const param = (opts.pathParam ?? "").replace(/^\/+/, "");
    path = path.replace(/\[\.\.\.path\]|\[id\]/, param.split("/").map(encodeURIComponent).join("/"));
  }
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const url = qs.toString() ? `${path}?${qs}` : path;
  const init: RequestInit = { method, credentials: "same-origin", signal: opts.signal, cache: "no-store" };
  if (opts.formData) init.body = opts.formData;
  else if (method === "POST") {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(opts.body ?? {});
  }
  try {
    const res = await fetch(url, init);
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
    if (!json) return { error: { type: "api", status: res.status, message: "پاسخ نامعتبر از سرور دریافت شد." } };
    return json;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return { error: { type: "network", message: "لغو شد" } };
    return { error: { type: "network", message: "ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید." } };
  }
}

export function errorText(e: ApiError | undefined): string {
  if (!e) return "";
  if (e.status === 503) return "اتصال فروشگاه هنوز تنظیم نشده است.";
  return e.message || "خطایی رخ داد. دوباره تلاش کنید.";
}
