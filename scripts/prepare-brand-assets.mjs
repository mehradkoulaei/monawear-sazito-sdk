import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { watermarkProduct } from '../src/lib/watermark.ts';

// Always read original v2 assets: running this twice never doubles the watermark.
const source = process.argv[2];
if (!source) throw Error('Pass the absolute path to v2 storefront/public/media.');
const output = path.resolve('public/images/brand');
const assets = [
  ['mona-hero-studio-1440.webp', 'mona-hero-restored.webp', true],
  ['mona-soft-edit-studio-1120.webp', 'mona-soft-restored.webp', true],
  ...[1, 2, 3, 4].map(i => [`mona-category-${i}-studio-1200.webp`, `mona-collection-${i}-restored.webp`, false]),
];
const manifest = [];
for (const [file, name, watermark] of assets) {
  const original = await readFile(path.join(source, file));
  const metadata = await sharp(original).metadata();
  // The collection images already contain their MONA identity; do not add a second mark.
  const result = watermark ? await watermarkProduct(original, metadata.width) : original;
  await writeFile(path.join(output, name), result);
  manifest.push({ file: name, source: file, sha256: createHash('sha256').update(original).digest('hex'), width: metadata.width, height: metadata.height, bytes: result.length, watermark: watermark ? 'embedded-v2' : 'original-branding-preserved' });
}
await copyFile(path.join(source, 'mona-logo.png'), path.join(output, 'mona-logo.png'));
await writeFile(path.join(output, 'restored-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
