import { NextRequest, NextResponse } from "next/server";
import { COOKIES, cookieOptions } from "@/lib/sazito/session";

/** Local (non-Sazito) route: clears every HttpOnly session cookie (JWT + guest checkout credentials). */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin) {
    try { if (new URL(origin).host !== host) return NextResponse.json({ error: { message: "forbidden" } }, { status: 403 }); } catch { return NextResponse.json({ error: { message: "forbidden" } }, { status: 403 }); }
  }
  const res = NextResponse.json({ data: { ok: true } });
  res.headers.set("Cache-Control", "no-store");
  for (const name of Object.values(COOKIES)) {
    res.cookies.set(name, "", { ...cookieOptions(name), maxAge: 0 });
  }
  return res;
}
