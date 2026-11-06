import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { isProductImage, productImageUrl } from '../src/lib/product-image-url.ts';
import { jsonLd } from '../src/lib/seo.ts';
import { watermarkProduct } from '../src/lib/watermark.ts';

const base = process.argv[2] || 'http://localhost:3100';
const results = [];
const photo = 'https://oss.sazito.com/apiuploads/mehrsaa/uploads/image/rootimage/1542/bd143105a83bcdee255926ba3a34f904.webp';
async function check(name, fn) {
  try { const details = await fn(); results.push({ name, passed: true, details }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); }
}
await check('Watermark source boundaries and duplicate prevention', () => {
  assert.ok(isProductImage(photo));
  for (const src of ['http://localhost/a.webp', 'https://oss.sazito.com.evil.test/a.webp', 'https://oss.sazito.com/another-store/a.webp', 'https://user@oss.sazito.com/a.webp', '/images/brand/mona-logo.png']) assert.equal(isProductImage(src), false);
  const url = productImageUrl(photo, 400);
  assert.ok(url.includes('w=640'));
  assert.equal(productImageUrl(url, 800), url);
});
await check('JSON-LD cannot break out of script element', () => {
  const value = { name: '</script><script>alert(1)</script>&' };
  const serialized = jsonLd(value);
  assert.ok(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), value);
});
await check('Original watermark produces proportional WebP derivatives', async () => {
  const source = await readFile('public/images/brand/hero-satin.webp');
  const buffer = await watermarkProduct(source, 384);
  const meta = await sharp(buffer).metadata();
  assert.equal(meta.format, 'webp'); assert.equal(meta.width, 384); assert.equal(meta.height, 288);
  await mkdir('outputs', { recursive: true });
  await writeFile('outputs/watermark-sample.webp', buffer);
  return { width: meta.width, height: meta.height, bytes: buffer.length };
});
for (const route of ['/', '/search', '/cart', '/checkout', '/account', '/order-tracking', '/size-guide']) {
  await check(`HTTP page ${route}`, async () => {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('<html lang="fa" dir="rtl"'));
    assert.ok(html.includes('WEAR YOUR OWN BEAUTY'));
    if (route === '/') {
      assert.ok(html.includes('rel="canonical"'));
      const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1])).flat();
      for (const type of ['Organization', 'WebSite', 'FAQPage']) assert.ok(scripts.some(s => s['@type'] === type));
      assert.ok(html.includes('fetchPriority="high"') || html.includes('fetchpriority="high"'));
    }
    if (['/cart', '/account', '/checkout'].includes(route)) assert.ok(/noindex/.test(html));
    return { status: response.status, htmlBytes: Buffer.byteLength(html) };
  });
}
await check('XML sitemap and robots', async () => {
  const [sitemap, robots] = await Promise.all([fetch(base + '/sitemap.xml'), fetch(base + '/robots.txt')]);
  assert.equal(sitemap.status, 200); assert.equal(robots.status, 200);
  assert.ok((await sitemap.text()).includes('/size-guide'));
  const text = await robots.text();
  assert.ok(text.includes('Disallow: /checkout')); assert.ok(text.includes('Sitemap:'));
});
await check('Image endpoint rejects arbitrary hosts and invalid widths', async () => {
  for (const url of ['/api/media/product?src=http://127.0.0.1/test&w=384', '/api/media/product?src=' + encodeURIComponent(photo) + '&w=123']) {
    assert.equal((await fetch(base + url)).status, 400);
  }
});
await check('Real v2 store photo: embedded WebP, cache and ETag/304', async () => {
  const url = base + productImageUrl(photo, 384);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-mona-watermark'), 'embedded-v2');
  const data = Buffer.from(await response.arrayBuffer());
  const meta = await sharp(data).metadata(); assert.equal(meta.format, 'webp'); assert.ok(meta.width <= 384);
  const cached = await fetch(url, { headers: { 'If-None-Match': response.headers.get('etag') } });
  assert.equal(cached.status, 304);
  await writeFile('outputs/watermarked-catalog-photo.webp', data);
  return { bytes: data.length, width: meta.width, height: meta.height, cachedStatus: cached.status };
});
await check('Record live SDK status without altering store data', async () => {
  const response = await fetch(base + '/api/sazito/products/list?pageSize=1');
  return { status: response.status, limitation: response.status === 401 ? 'Configured Sazito SDK key rejected; live commerce not verified.' : undefined };
});
await mkdir('outputs', { recursive: true });
await writeFile('outputs/redesign-verification.json', JSON.stringify({ base, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
