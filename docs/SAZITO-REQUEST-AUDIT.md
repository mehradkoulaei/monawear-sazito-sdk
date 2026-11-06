# Sazito request audit

## Latest result after key replacement

The user supplied a replacement SDK key, which was saved only in `.env.local`.
All three direct public GET checks now return **200**: general information,
categories, and products. The earlier 401 observations below describe the previous
key. The current machine-readable report is `outputs/sazito-request-verification.json`.
Checkout and customer operations were not exercised by this read-only check.

Verified on 2026-11-02 against the official documentation at
https://developers.sazito.com/llms-full.txt and the official SDK HTTP implementation:
https://github.com/sazito/client-sdk/blob/3e10832291cde448e27528715220fa3467639203/src/core/http-client.ts

The installed package is `@sazito/client-sdk` 1.3.3. The application already delegates
URL, query, and payload serialization to that SDK; no alternate API implementation
or authentication header change was needed.

## Actual request contract

- Base URL: `https://sdk.sazito.com`.
- Store selection: `x-domain: monawear.ir` (domain without a protocol).
- Optional configured key: `Sazito-API-Key`; this is separate from customer authentication.
- Customer authentication: raw JWT in `Authorization`, without `Bearer`.
- SDK JSON requests use `Content-Type: application/json`.
- Product pagination: SDK `page` / `pageSize` become `page_number` / `page_size` on the wire.
- SDK `sort: 'newest'` becomes `sort=date`.
- Product category, stock, and discount filters are JSON serialized in `filters[]`.
- Version 1.3.3 emits `in_stock` for `availableOnly: false`; the existing UI mapping
  follows the installed implementation. Do not invert it based on the option name alone.

Equivalent cURL for the verified public product request (POSIX shell syntax):

```sh
curl --get 'https://sdk.sazito.com/api/v1/storefront/products' \
  --header 'x-domain: monawear.ir' \
  --header "Sazito-API-Key: ${SAZITO_API_KEY}" \
  --header 'Content-Type: application/json' \
  --data-urlencode 'sort=date' \
  --data-urlencode 'page_number=1' \
  --data-urlencode 'page_size=1'
```

The environment variable is a placeholder for a private shell environment value;
no actual key is included in this document. Public catalog calls carry no customer JWT.
Do not use the management API's `X-API-Key` header in place of `Sazito-API-Key`.

## Verification and remaining limitation

Run `node scripts/verify-sazito-requests.mjs` to validate generated request structure
offline with fake credentials. Add `--live` to replay only three public GET requests
using `.env.local`. It never sends OTP, cart, checkout, analytics, or customer requests.
Its report redacts credential values and does not save response bodies.

With the configured domain and key, the fresh direct upstream requests returned:

| Request | Status |
| --- | --- |
| `/api/v2/general/info` | 401 |
| `/api/v1/product_categories?page_size=100` | 401 |
| `/api/v1/storefront/products?sort=date&page_number=1&page_size=1` | 401 |

These direct requests bypass the application's Next.js cache and BFF, and retain
the SDK-generated URL and headers. This verifies the request structure, but does
not establish why the upstream rejects access. Key validity, domain permissions,
and storefront SDK access remain unverified. Live product and commerce functionality
cannot be certified from these responses. The existing credentials were not modified.

Machine-readable evidence: `outputs/sazito-request-verification.json`.
