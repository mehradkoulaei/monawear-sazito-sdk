import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import nextEnv from '@next/env';
import { createSazitoClient, CredentialsManager, MemoryStorage } from '@sazito/client-sdk';

// Capture SDK-generated requests without sending credentials or changing store data.
nextEnv.loadEnvConfig(process.cwd());
const domain = (process.env.SAZITO_DOMAIN || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
assert(domain, 'SAZITO_DOMAIN is required');
const requests = [];
const client = createSazitoClient({
  domain, apiKey: 'contract-test-key', retry: { enabled: false },
  customFetchApi: async (url, init) => {
    requests.push({ url: String(url), method: init.method, headers: new Headers(init.headers) });
    return new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  },
}, new CredentialsManager(new MemoryStorage()));

await client.general.getInfo();
await client.categories.list({ pageSize: 100 });
await client.products.list({ page: 1, pageSize: 1, sort: 'newest' });
await client.products.list({ categories: [8], availableOnly: false, discountedOnly: true, page: 2, pageSize: 24 });
await client.users.getCurrentUser({ headers: { Authorization: 'contract.raw.jwt' } });

for (const request of requests) {
  assert.equal(new URL(request.url).origin, 'https://sdk.sazito.com');
  assert.equal(request.method, 'GET');
  assert.equal(request.headers.get('x-domain'), domain);
  assert.equal(request.headers.get('Sazito-API-Key'), 'contract-test-key');
  assert.equal(request.headers.get('Content-Type'), 'application/json');
}
assert.equal(new URL(requests[0].url).pathname, '/api/v2/general/info');
assert.equal(new URL(requests[1].url).searchParams.get('page_size'), '100');
const products = new URL(requests[2].url);
assert.equal(products.pathname, '/api/v1/storefront/products');
assert.equal(products.searchParams.get('page_number'), '1');
assert.equal(products.searchParams.get('page_size'), '1');
const filters = JSON.parse(new URL(requests[3].url).searchParams.get('filters[]'));
assert(filters.some((filter) => filter.name === 'in_stock'));
assert(filters.some((filter) => filter.name === 'has_raw_price' && filter.value === true));
assert.equal(requests[4].headers.get('Authorization'), 'contract.raw.jwt');
assert(requests.slice(0, 4).every((request) => !request.headers.has('Authorization')));

const report = {
  checkedAt: new Date().toISOString(),
  sdkVersion: JSON.parse(await fs.readFile('node_modules/@sazito/client-sdk/package.json', 'utf8')).version,
  contract: 'passed',
  requests: requests.map(({ url, method, headers }) => ({
    url, method,
    headers: Object.fromEntries([...headers].map(([name, value]) => [name, /authorization|api-key/i.test(name) ? '[REDACTED]' : value])),
  })),
  live: [],
};
if (process.argv.includes('--live')) {
  // Only three public GETs; no OTP, cart, checkout, visits, or customer requests.
  for (const request of requests.slice(0, 3)) {
    const headers = new Headers(request.headers);
    headers.delete('Sazito-API-Key');
    const key = (process.env.SAZITO_API_KEY || '').trim();
    if (key) headers.set('Sazito-API-Key', key);
    const response = await fetch(request.url, { headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000) });
    await response.body?.cancel();
    report.live.push({ url: request.url, status: response.status, apiKeyIncluded: Boolean(key) });
  }
}
await fs.mkdir('outputs', { recursive: true });
await fs.writeFile('outputs/sazito-request-verification.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ contract: report.contract, live: report.live }, null, 2));
