import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { RequestOptions, SazitoClient, SazitoResponse, SazitoError } from "@sazito/client-sdk";
import { serverEnv } from "@/lib/env";
import { createClient, isConfigured, notConfiguredError } from "./client";
import { devLog, newRequestId } from "./logger";
import { COOKIES, cookieOptions, diffSession, readSession, type Session } from "./session";

export type AuthMode =
  | "public" // no credentials needed, cacheable
  | "guest" // guest credential cookies (cart / invoice / payment)
  | "user" // JWT required
  | "either" // guest credentials or JWT
  | "identifier"; // caller supplies an order identifier

export interface RouteCtx<I> {
  client: SazitoClient;
  input: I;
  /** pass as the last argument of every SDK call (carries Authorization + request id) */
  opts: RequestOptions;
  session: Session;
  params: Record<string, string | string[] | undefined>;
  request: NextRequest;
  formData?: FormData;
  /** set the auth cookie after a successful login */
  setAuth: (jwt: string) => void;
}

export interface RouteDef<S extends z.ZodTypeAny | undefined> {
  /** e.g. "products" */
  module: string;
  /** e.g. "list" */
  operation: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  auth: AuthMode;
  /** Next.js revalidate seconds for public GET calls (omit/false = no cache) */
  revalidate?: number | false;
  /** Zod schema for query string (GET/DELETE) or JSON body (POST/PUT). Use .strict(). */
  schema?: S;
  multipart?: boolean;
  run: (ctx: RouteCtx<S extends z.ZodTypeAny ? z.infer<S> : undefined>) => Promise<SazitoResponse<unknown>>;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function statusFor(error: SazitoError): number {
  if (error.type === "network") return /timeout/i.test(error.message) ? 504 : 502;
  if (error.type === "validation") return error.status ?? 400;
  const s = error.status ?? 400;
  return s >= 400 && s < 600 ? s : 400;
}

function queryToObject(sp: URLSearchParams): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  const taxonomy: Record<string, string | string[]> = {};
  let hasTaxonomy = false;

  sp.forEach((v, k) => {
    const match = k.match(/^taxonomy\[([^\]]+)\]$/);
    if (match) {
      const attrId = match[1];
      const vals = v.includes(",") ? v.split(",") : v;
      taxonomy[attrId] = vals;
      hasTaxonomy = true;
    } else {
      o[k] = v;
    }
  });

  if (hasTaxonomy && !o.taxonomy) {
    o.taxonomy = taxonomy;
  }
  return o;
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser or same-origin GET navigations
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function fail(
  status: number,
  message: string,
  meta: { module: string; operation: string; rid: string },
  details?: unknown,
) {
  const res = NextResponse.json(
    { error: { type: status === 400 ? "validation" : "api", status, message, details } },
    { status },
  );
  applyDebugHeaders(res, meta, 0);
  return res;
}

function applyDebugHeaders(
  res: NextResponse,
  meta: { module: string; operation: string; rid: string },
  upstreamMs: number,
) {
  res.headers.set("Cache-Control", "no-store");
  if (!serverEnv.isDev) return;
  res.headers.set("X-Sazito-Module", meta.module);
  res.headers.set("X-Sazito-Operation", meta.operation);
  res.headers.set("X-Sazito-Request-Id", meta.rid);
  res.headers.set("X-Sazito-Upstream-Ms", String(upstreamMs));
  res.headers.set("Server-Timing", `sazito;dur=${upstreamMs}`);
}

/**
 * Wraps ONE fixed Sazito operation as a Next.js route handler.
 * - validates input with Zod (strict) — booking fields are rejected by the schemas
 * - hydrates the SDK per-request credentials from HttpOnly cookies and writes changes back
 * - passes the JWT per request (the SDK's token storage is browser-only)
 * - preserves the SDK `{ data } | { error }` contract
 */
export function defineRoute<S extends z.ZodTypeAny | undefined = undefined>(def: RouteDef<S>) {
  const label = `${def.module}/${def.operation}`;
  return async function handler(
    request: NextRequest,
    context: { params: Promise<Record<string, string | string[] | undefined>> },
  ): Promise<Response> {
    const rid = newRequestId();
    const meta = { module: def.module, operation: def.operation, rid };
    const started = performance.now();
    let upstreamMs = 0;

    if (def.method !== "GET" && !sameOrigin(request)) {
      return fail(403, "درخواست از مبدأ نامعتبر ارسال شده است.", meta);
    }
    if (!isConfigured()) {
      const e = notConfiguredError();
      const res = NextResponse.json(e, { status: 503 });
      applyDebugHeaders(res, meta, 0);
      return res;
    }

    const session = readSession(request.cookies);
    if (def.auth === "user" && !session.jwt) {
      return fail(401, "برای این عملیات باید وارد حساب کاربری شوید.", meta);
    }

    // ---- input ----
    let input: unknown = undefined;
    let formData: FormData | undefined;
    try {
      if (def.multipart) {
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_UPLOAD_BYTES) return fail(413, "حجم فایل بیش از حد مجاز است.", meta);
        formData = await request.formData();
      } else if (def.schema) {
        const raw =
          def.method === "GET" || def.method === "DELETE"
            ? queryToObject(request.nextUrl.searchParams)
            : await request.json().catch(() => ({}));
        const parsed = def.schema.safeParse(raw);
        if (!parsed.success) {
          return fail(400, "داده‌های ارسالی نامعتبر است.", meta, parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
        }
        input = parsed.data;
      }
    } catch {
      return fail(400, "درخواست نامعتبر است.", meta);
    }

    const params = (await context.params) ?? {};
    const client = createClient({
      storage: session.storage,
      fetchCtx: {
        label,
        requestId: rid,
        revalidate: def.auth === "public" && def.revalidate ? def.revalidate : false,
        onUpstreamMs: (ms) => {
          upstreamMs += ms;
        },
      },
    });

    const opts: RequestOptions = { headers: { "X-Request-ID": rid } };
    if (def.auth !== "public" && session.jwt) opts.headers = { ...opts.headers, Authorization: session.jwt };

    let newJwt: string | undefined;
    let result: SazitoResponse<unknown>;
    try {
      result = await def.run({
        client,
        input: input as never,
        opts,
        session,
        params,
        request,
        formData,
        setAuth: (jwt: string) => {
          newJwt = jwt;
        },
      });
    } catch (e) {
      result = { error: { type: "network", message: e instanceof Error ? e.message : "خطای ناشناخته" } };
    }

    const status = result.error ? statusFor(result.error) : 200;
    const res = NextResponse.json(result, { status });
    applyDebugHeaders(res, meta, upstreamMs);

    if (def.auth === "public" && typeof def.revalidate === "number" && def.revalidate > 0 && !result.error) {
      res.headers.set(
        "Cache-Control",
        `public, max-age=${def.revalidate}, s-maxage=${def.revalidate}, stale-while-revalidate=${def.revalidate * 2}`
      );
    }

    // ---- persist credentials ----
    // The SDK clears stored credentials on ANY error (even network/5xx). Only sync cookie changes when the
    // call succeeded or failed with a definite client-side (4xx) answer, so a transient outage never drops a cart.
    const definite = !result.error || (result.error.type !== "network" && (result.error.status ?? 400) < 500);
    if (definite) {
      for (const ch of diffSession(session)) {
        if (ch.value) res.cookies.set(ch.name, ch.value, cookieOptions(ch.name));
        else res.cookies.set(ch.name, "", { ...cookieOptions(ch.name), maxAge: 0 });
      }
    }
    if (newJwt && !result.error) res.cookies.set(COOKIES.auth, newJwt, cookieOptions(COOKIES.auth));

    devLog(`${def.method.padEnd(6)} /api/sazito/${label.padEnd(30)} ← ${status}  total ${Math.round(performance.now() - started)}ms  rid=${rid}`);
    return res;
  };
}
