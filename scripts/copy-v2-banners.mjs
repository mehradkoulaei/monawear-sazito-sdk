import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw Error('Pass the absolute v2 storefront/public/media path. The source is read-only.');
const output = path.resolve('public/images/brand/v2');
await mkdir(output, { recursive: true });
const files = [
  ...[640, 960, 1440].map(w => `mona-hero-studio-${w}.webp`),
  ...[480, 800, 1120].map(w => `mona-soft-edit-studio-${w}.webp`),
  ...[1, 2, 3, 4].flatMap(i => [320, 480, 800, 1200].map(w => `mona-category-${i}-studio-${w}.webp`)),
];
const manifest = [];
for (const file of files) {
  await copyFile(path.join(source, file), path.join(output, file));
  const data = await readFile(path.join(output, file));
  manifest.push({ file, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), original: true });
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Copied ${files.length} original WebP variants without modification.`);
