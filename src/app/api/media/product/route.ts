import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { isProductImage, PRODUCT_IMAGE_WIDTHS } from "@/lib/product-image-url";
import { watermarkProduct } from "@/lib/watermark";

// Ensure reliable DNS resolution for Iranian CDN hosts (avoiding Cloudflare SERVFAIL for arvancdn.ir)
try {
  dns.setServers(["8.8.8.8", "178.22.122.100", "1.1.1.1"]);
} catch {
  // Ignore if restricted
}

export const runtime = "nodejs";
const directory = path.join(process.cwd(), ".image-cache", "mona-v2");
const pending = new Map<string, Promise<Buffer>>();
const MAX_BYTES = 8 * 1024 * 1024;
let active = 0;
const queue: Array<() => void> = [];

async function processImage(src: string, width: number, key: string): Promise<Buffer> {
  if (active >= 8) await new Promise<void>((resolve) => queue.push(resolve));
  active++;
  try {
    const response = await fetch(src, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000) });
    const type = response.headers.get("content-type");
    // Sazito OSS sometimes omits Content-Type; Sharp still validates the actual bytes.
    if (!response.ok || (type && !/^image\/(jpeg|png|webp|avif)(;|$)/i.test(type)) || Number(response.headers.get("content-length")) > MAX_BYTES) throw Error("Invalid image");
    const reader = response.body?.getReader();
    if (!reader) throw Error("Empty image");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); throw Error("Image too large"); }
      chunks.push(value);
    }
    const data = await watermarkProduct(Buffer.concat(chunks), width);
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, key + ".webp");
    const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, data);
    await rename(temporary, target);
    return data;
  } finally { active--; queue.shift()?.(); }
}

/** Fixed HTTPS CDN, strict widths, no redirects; never fetch an arbitrary host or local URL. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const src = query.get("src") || "";
  const width = Number(query.get("w") || 768);
  if (!isProductImage(src) || !(PRODUCT_IMAGE_WIDTHS as readonly number[]).includes(width)) return new Response("Invalid image request", { status: 400 });
  const key = createHash("sha256").update(`mona-v2:${src}:${width}`).digest("hex");
  const headers = { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "X-Mona-Watermark": "embedded-v2", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", ETag: `"${key}"` };
  try {
    const data = await readFile(path.join(directory, key + ".webp"));
    if (request.headers.get("if-none-match") === headers.ETag) return new Response(null, { status: 304, headers });
    return new Response(new Uint8Array(data), { headers });
  } catch { /* Generate an uncached derivative. */ }
  if (pending.size >= 24 && !pending.has(key)) return new Response("Retry image", { status: 503, headers: { "Retry-After": "2", "Cache-Control": "no-store" } });
  try {
    let task = pending.get(key);
    if (!task) { task = processImage(src, width, key); pending.set(key, task); }
    return new Response(new Uint8Array(await task), { headers });
  } catch (err) {
    console.error("[media/product] Watermark failed, redirecting to raw source:", src, err);
    if (isProductImage(src)) {
      return Response.redirect(src, 302);
    }
    return new Response("Image temporarily unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  } finally { pending.delete(key); }
}
