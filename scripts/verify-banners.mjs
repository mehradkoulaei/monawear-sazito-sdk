import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const base = process.argv[2] || 'http://localhost:3000';
const manifest = JSON.parse(await readFile('public/images/brand/v2/manifest.json', 'utf8'));
const checks = [];
for (const entry of manifest) {
  const data = await readFile('public/images/brand/v2/' + entry.file);
  assert.equal(createHash('sha256').update(data).digest('hex'), entry.sha256);
  assert.equal(data.length, entry.bytes);
  const meta = await sharp(data).metadata();
  const expected = Number(entry.file.match(/-(\d+)\.webp$/)[1]);
  assert.equal(meta.width, expected);
  assert.equal(meta.format, 'webp');
  checks.push({ asset: entry.file, width: meta.width, height: meta.height, bytes: data.length, passed: true });
}
const response = await fetch(base);
assert.equal(response.status, 200);
const html = await response.text();
for (const text of ['THE MONA COLLECTION', 'SOFT FEELING. BEAUTIFUL YOU.', 'MONA / EVERYDAY COLLECTION', 'THE SOFT EDIT', 'LITTLE LUXURIES, EVERY DAY', 'A little love for yourself.', 'YOUR MOOD, YOUR STYLE', 'مجموعه‌ها را ببین', 'مدل‌ها و گزینه‌های سایز', 'تصاویر و جزئیات هر مدل', 'ست‌های دو تکهٔ مونا', 'طرح‌ها و مدل‌های فانتزی', 'دیدن محصولات', 'دیدن مدل‌های لباس خواب']) {
  assert.ok(html.includes(text), `Missing original copy: ${text}`);
}
assert.ok(!html.includes('MADE FOR YOUR EVERYDAY BEAUTY'));
assert.ok(!html.includes('hero-caption'));
assert.equal((html.match(/data-slide-id=/g) || []).length, 2);
assert.ok(html.includes('fetchPriority="high"') || html.includes('fetchpriority="high"'));
assert.ok(html.includes('rel="canonical"'));
checks.push({ page: base, originalBannerCopy: true, slideCount: 2, heroPriority: true, canonicalPreserved: true, passed: true });
await mkdir('outputs', { recursive: true });
await writeFile('outputs/banner-asset-verification.json', JSON.stringify({ base, checks }, null, 2));
console.log(`Passed: ${manifest.length} exact asset hashes/dimensions and homepage original-copy/slider/SEO checks.`);
