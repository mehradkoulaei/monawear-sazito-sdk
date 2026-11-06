# Mona Wear redesign — implementation and verification

Completed locally on 2 November 2026. No deployment, orders, payments, OTP messages, customer account mutations, or credential changes were performed.

## Design and implementation

- Restored the exact v2 typographic wordmark: MONA in Georgia, original letter spacing and burgundy #681b2d, with WEAR YOUR OWN BEAUTY in Arial. Shared Brand component serves header/footer; original PNG was also recovered for brand metadata.
- Reworked the header into a centered brand row and separate navigation row. Real Sazito menu/category data and nested mobile navigation remain in place. Added mobile home/category/search/cart/account dock, keyboard menu dismissal, and visible focus styles.
- Preserved the three-slide hero, with native CSS transitions, swipe navigation, numbered indicators, explicit pause/play, focus/hover/document-visibility pause, reduced-motion support, and safe inactive slides. Only the first/current slide image mounts; the first image is preloaded with high fetch priority.
- Recomposed recovered photography using separate HTML copy and CTA panels, 4:3 mobile hero art, contained desktop art, 3:2 campaign art, and a 4:5 Soft Edit feature. Product details stay visible without stretching or forced portrait crops. Responsive Next Image delivery generates device-sized variants; there are no newly invented product photos or catalog records.
- Reworked real category tiles, campaign cards, product card framing/quick-add placement, product detail panels and gallery, cart/checkout summaries, checkout step spacing, account forms, search shortcuts/clear state, FAQ, service strip, and footer. Existing commerce handlers remain intact.
- Adapted category-first browsing, merchandising sections and mobile shopping access after reviewing https://veniza.ir. No competitor assets or product information were copied.
- Improved Persian shopping/help copy and removed configuration details from customer error and size-guide screens. Product descriptions/specifications still come from Sazito.

## Recovered assets and watermark

Source: D:/my projects/monawear.ir/monawear.ir-v2/storefront.

- Original components/storefront.tsx wordmark and matching globals.css proportions/colors.
- public/media/mona-logo.png, mona-hero-studio-1440.webp, mona-soft-edit-studio-1120.webp, and mona-category-{1..4}-studio-1200.webp.
- lib/watermark.ts copied unchanged. Its subtle central MONA and proportional corner MONA · monawear.ir marks are embedded into WebP pixels; small derivatives use the original shorter MONA label.
- Shared ProductImage now covers product cards, gallery thumbnails, main image, lightbox, hover zoom, search results, cart thumbnails, and recently viewed photography. Checkout currently renders a text summary, so it introduces no separate unmarked image path.
- /api/media/product accepts only the verified Mona OSS image namespace, fixed widths and HTTPS; rejects other hosts, credentials, redirects and query-bearing sources; limits input size/pixels; limits concurrent transforms to four and outstanding derivatives to 24. Identical requests share work. Derivatives use disk caching, WebP, ETag/304 and cache headers. Errors are not cached as successful images. Missing CDN Content-Type is accepted only with actual image decoding by Sharp.
- Local derivatives bypass the remote watermark loader. The two unbranded editorial sources receive the same original mark at preparation time. Collection photography already contains MONA branding, which is preserved without another mark. Logos, icons and unrelated decoration are excluded.
- scripts/prepare-brand-assets.mjs always starts with the original v2 files, preventing cumulative watermarking/recompression. Active outputs have distinct filenames to avoid stale Next image caches. restored-manifest.json records source SHA-256, dimensions, bytes, and marking policy.
- Active hero derivative: 1440×1080, 100,440 bytes. Soft Edit: 1120×1400, 53,416 bytes before responsive Next delivery. Six recovered active WebP assets total about 470 KB at source resolution. Existing legacy assets remain available.

## SEO and GEO

- Added/expanded unique home, product, category and search titles/descriptions, canonical handling, Open Graph/Twitter imagery and product alt text.
- One homepage h1; product card h3 headings; semantic category/listing, product, FAQ, breadcrumb and form structure.
- Escaped JSON-LD prevents catalog/CMS text from closing script elements. Added Organization, WebSite, FAQPage and CollectionPage/ItemList data; retained and hardened Product and BreadcrumbList data.
- Product Offer uses the cheapest available enabled variant and matching availability. IRR schema price follows the existing displayed-toman configuration (display price ×10); confirm the upstream denomination when valid SDK access is restored. No prices, stock, materials, shipping promises, ratings or brand specifications were fabricated.
- Filtered search/category variants are noindex/follow. Private cart/account/checkout pages retain noindex. Existing robots exclusions remain. Sitemap excludes disabled CMS pages, includes size guide and removes duplicates, using real catalog URLs when available.
- Existing .env.local explicitly uses http://localhost:3000; it was preserved. Set NEXT_PUBLIC_SITE_URL=https://monawear.ir for a production deployment so canonical, sitemap and social URLs use the public origin.

## Performance and technical quality

- Existing Next.js 15/Sazito architecture, API routes, authentication and commerce logic retained.
- Streamed catalog, header data and footer independently; the hero no longer awaits all product requests. Existing public data caching remains in place; authenticated APIs were not changed.
- Replaced Framer Motion hero animation with CSS and removed the unused dependency. Search code loads on demand. Preloaded local variable Persian font with swap display; no remote font request.
- Corrected image ratios and explicit media space; lazy below-fold assets and responsive sizes; priority limited to the first hero and first two listing images. AVIF/WebP enabled for Next's optimizer; watermark outputs use WebP.
- Hover zoom updates its element position directly instead of re-rendering the full product detail component for each pointer move.
- Fixed obsolete next lint command to eslint ., with generated build output and backup exclusions. Sharp is an explicit locked server dependency.
- MONA_BUILD_DIR allows isolated verification output. Final production build reports homepage route code 5.68 KB, first-load JS 160 KB, shared JS 103 KB. These are Next build statistics, not measured Core Web Vitals or a before/after performance claim.

## Verification actually executed

- npm run typecheck: passed.
- npm run lint: passed, zero errors; two pre-existing anonymous-default-export warnings in ESLint/PostCSS config.
- Production build: passed, 73 static pages generated. Used MONA_BUILD_DIR=.next-production with elevated filesystem access because the sandbox rejected nested Next output directories. No ignored errors or skipped type validation.
- node scripts/verify-redesign.mjs http://localhost:3100: all 14 read-only/media checks passed against final production output. Raw result: outputs/redesign-verification.json.
- HTTP 200 for home, search, cart, checkout, account, order tracking and size guide; metadata, Persian RTL HTML, homepage schema, hero priority, private-page noindex, sitemap and robots checked.
- Malicious image host and invalid width rejected. A real v2 store photo produced a 384×384 WebP of 4,142 bytes with embedded watermark; matching ETag returned 304. Proportional derivative and safe JSON serialization tests also passed.
- Browser checks at requested 320, 390, 768 and 1280 CSS-pixel viewports; no horizontal overflow in observed small-phone/tablet/desktop layouts. Final mobile DOM check found zero missing alt attributes and zero broken visible images.
- Opened mobile menu, search and cart drawers; exercised search typing/clear behavior, carousel pause/selection and account login-method switching without submitting credentials. Reviewed campaign/Soft Edit/FAQ/footer and account layouts.
- Production screenshots: outputs/redesign-desktop.jpg, outputs/redesign-mobile.jpg and outputs/redesign-full-page.jpg. Watermark sample: outputs/watermarked-catalog-photo.webp.

## Remaining limitations

- Configured storefront SDK requests return HTTP 401 for products, categories and store information. The owner explicitly chose to finish with this limitation. No stale v2 catalog or fake records were substituted. Thus product/category pages with live data, variant selection/quick-add, populated cart, authenticated accounts, shipping, discounts and completed payment flows could not be verified end to end. Source implementations are updated; successful backend integration is not claimed.
- Current unavailable-data state intentionally hides catalog rails/categories. Store contact/CMS footer content will populate from the actual API after access is restored. The read-only image CDN works independently and was tested successfully.
- Lighthouse, field LCP/INP/CLS, screen-reader auditing, and real-device performance were not run. Browser layout/focus/alt checks are not a substitute for a full accessibility audit.
- Sitemap retains the existing 20×100 product enumeration cap. Image disk cache needs normal hosting storage/retention management; cache keys assume source photo URLs change when originals change.
- A Node module-format warning appears when standalone verification/preparation scripts import TypeScript on Node 24. Scripts complete successfully; the production build does not depend on native TypeScript execution.

## Files and recovery

There was no Git repository in this workspace. Before editing, source/config/dependency files were archived to docs/redesign-before/source.zip; .env.local was excluded and preserved. The existing original project archive remains untouched. Next also updated tsconfig.json formatting and added the isolated build type directory.

Full source/config comparison is in outputs/redesign-changed-files.json. Additional changed/new files include .gitignore, tsconfig.json, the two scripts, documentation, original/recovered public brand assets and manifests.

### Modified source/config files

- src/app/globals.css
- src/app/layout.tsx
- src/app/page.tsx
- src/app/sitemap.ts
- src/app/account/page.tsx
- src/app/cart/page.tsx
- src/app/checkout/page.tsx
- src/app/search/page.tsx
- src/app/size-guide/page.tsx
- src/app/[...slug]/page.tsx
- src/components/state.tsx
- src/components/account/auth-forms.tsx
- src/components/cart/cart-lines.tsx
- src/components/cart/cart-page.tsx
- src/components/checkout/checkout-flow.tsx
- src/components/home/hero-slider.tsx
- src/components/home/sections.tsx
- src/components/layout/announcement-bar.tsx
- src/components/layout/breadcrumbs.tsx
- src/components/layout/footer.tsx
- src/components/layout/header.tsx
- src/components/layout/search-overlay.tsx
- src/components/layout/site-header.tsx
- src/components/products/category-page.tsx
- src/components/products/product-card.tsx
- src/components/products/product-experience.tsx
- src/components/products/product-grid.tsx
- src/components/products/product-image.tsx
- src/components/products/product-page.tsx
- src/components/products/product-rail.tsx
- src/components/products/recently-viewed.tsx
- src/config/site.ts
- package.json
- package-lock.json
- next.config.mjs
- tailwind.config.ts
- eslint.config.mjs

### Added source files

- src/lib/product-image-url.ts
- src/lib/seo.ts
- src/lib/watermark.ts
- src/components/layout/brand.tsx
- src/app/api/media/product/route.ts

### Re-run locally

With the normal development server running on 3000:

    npm run verify:redesign -- http://localhost:3000

For isolated production verification in PowerShell:

    $env:MONA_BUILD_DIR='.next-production'
    npm run build
    npm run start -- --port 3100
    npm run verify:redesign -- http://localhost:3100

The verification server started for this task was stopped after checks. The existing development preview on port 3000 was preserved.
