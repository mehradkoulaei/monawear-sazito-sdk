# Original Mona banner restoration and slider/header correction

Completed locally on 2 November 2026. v2 was used read-only. No backend, credential, dependency, product-data, checkout or authentication changes were made in this pass.

## Restored v2 identity

The active homepage in v2/storefront/components/storefront.tsx defines one main hero, one Soft Edit editorial banner, and four collection cards. Those six original compositions now replace the rewritten v3 banner copy and unrelated discount/newness captions.

| Composition | Original live text restored |
| --- | --- |
| Main hero | THE MONA COLLECTION; پوشاک مونا; لباس خواب و راحتی، / به انتخاب تو; مدل‌های مونا را ببین؛ از بادی و لباس خواب تا ست‌های راحتی. / تصاویر و سایز هر مدل در صفحهٔ محصول آمده است.; دیدن محصولات; تصاویر، قیمت و گزینه‌های هر مدل |
| Hero image overlays | SOFT FEELING. BEAUTIFUL YOU.; MONA / EVERYDAY COLLECTION; M with the art of feeling good |
| Soft Edit | THE SOFT EDIT; LITTLE LUXURIES, EVERY DAY; لباس خواب، / به انتخاب تو; مدل‌های لباس خواب مونا را ببین. / برای مقایسهٔ طرح، سایز و قیمت، / جزئیات هر محصول را باز کن.; دیدن مدل‌های لباس خواب; A little love for yourself. |
| بادی | مدل‌ها و گزینه‌های سایز |
| لباس خواب | تصاویر و جزئیات هر مدل |
| تاپ و شلوار | ست‌های دو تکهٔ مونا |
| فانتزی | طرح‌ها و مدل‌های فانتزی |
| Collection section | YOUR MOOD, YOUR STYLE; مجموعه‌ها را ببین; از دسته‌بندی دلخواهت شروع کن. |

All 22 responsive WebP files in public/images/brand/v2 were compared directly with the original v2/public/media files and are byte-identical. No generation, restaging, recoloring, cropping, extra watermark or re-encoding was applied. The source images include their original colors/backgrounds. Embedded MONA WEAR lettering on collection photography is not duplicated in HTML.

The v2 hero and Soft Edit content are the two slider campaigns. Soft Edit also retains its original editorial section below the collections. Typography restores the main hero's regular-weight heading with burgundy emphasis, original white ground, original annotation/edition labels and the original stamp text. The Soft Edit heading remains regular-weight ink, matching v2.

Existing v3 links replace v2's /shop route. Collection cards use real category routes when the live tree supplies them; otherwise they link to the supported v3 search for the same original category name. These are recovered editorial navigation cards, not mock product data.

## Root causes and corrections

- **Perceived broken navigation:** v3 changed the selected index before its 650ms opacity/visibility exit finished. The old scene could remain visible while the indicator referred to the new one; outgoing image elements could also disappear during that exit. The complete scene now switches immediately, with a subtle image entrance effect. Both original slider images stay mounted, with the second fetched at low priority. Exactly one slide is visible, interactive and announced at a time.
- **Resume blocked by focus:** the old autoplay effect stopped while any carousel element had focus, including its play button. Explicit resume now works while the rotation button retains focus. Keyboard interaction with other content stops rotation; hover/document-visibility pausing and reduced-motion defaults remain supported.
- **Gesture conflicts:** one Pointer Events path handles horizontal mouse/touch/pen dragging. Interactive controls and CTAs are excluded from drag starts, vertical scrolling remains native, and cancel clears the gesture. RTL arrows, indicators, keyboard arrows, wraparound and autoplay all share the same index state.
- **Cluttered controls:** removed the full-width control bar, MADE FOR YOUR EVERYDAY BEAUTY caption and visible counter. Compact arrows, two indicators and a small working rotation toggle are integrated into the copy panel. On phones they share a reserved top row with the campaign kicker. An observed 320px heading-boundary overlap was corrected with explicit row clearance.
- **Off-center mobile logo:** 44px / flexible / auto columns were inherently asymmetric. The header now uses equal minmax(0,1fr) side columns around an intrinsic-width center logo, with explicit grid placement for each side. Secondary header search hides at the narrowest widths; the existing mobile search dock remains available.

## Verification actually performed

- Reused the running development server at http://localhost:3000 and inspected the actual homepage in the in-app browser.
- npm run typecheck: passed.
- npm run lint: passed with zero errors and the same two pre-existing anonymous-default-export warnings.
- Final isolated production build: passed, including lint/types and generation of 73 static pages. Homepage first-load JS remains 160 KB in Next's build output; no Core Web Vitals improvement is claimed from this number.
- node scripts/verify-banners.mjs http://localhost:3100: passed original-copy, slider structure, priority/canonical, 22 asset hash and dimension checks. The originals were separately compared directly against v2, not only the copied manifest.
- Existing node scripts/verify-redesign.mjs http://localhost:3100: all 14 read-only page/metadata/robots/sitemap/watermark checks passed. Product image watermark generation and ETag/304 behavior remain intact.
- Browser tests exercised next, previous, previous wraparound, both indicators, active image/text/indicator synchronization, RTL keyboard arrows, actual timed autoplay advancement, pause and explicit resume. One visible scene with opacity 1 and the correct original loaded image was observed immediately after navigation.
- The shared pointer swipe/drag path was tested in both directions on mobile-sized production output. Real physical touchscreen hardware was not used.
- Phone widths 320, 360, 390 and 430px were checked on both slides; 768px tablet and 1440px desktop were also checked. No horizontal overflow or control/text overlap remained. Header controls did not overlap the logo.

| Requested phone width | Wordmark center offset from content viewport center |
| --- | ---: |
| 320px | -0.10 CSS px |
| 360px | -0.10 CSS px |
| 390px | +0.11 CSS px |
| 430px | +0.11 CSS px |

These subpixel CSS offsets reflect browser layout rounding; the scrollbar gutter is excluded from content viewport measurements. Full measured observations are in outputs/banner-ui-verification.json, including checks for both campaigns at all four phone widths.

## Files changed

- src/components/home/hero-slider.tsx — synchronized scene state, integrated controls, original copy, autoplay/focus and pointer navigation.
- src/components/home/banner-image.tsx — shared responsive original-asset renderer.
- src/components/home/sections.tsx — four exact collection cards and original Soft Edit editorial; removed mismatched invented campaigns.
- src/components/layout/header.tsx and src/app/globals.css — balanced grid header and targeted banner/control typography/layout.
- src/config/site.ts — original campaign and collection content, with obsolete invented banner configuration removed.
- src/app/page.tsx — removed mismatched campaign section; retained streamed catalog rendering and metadata.
- src/app/layout.tsx — social image points to the displayed original hero; existing SEO structure retained.
- scripts/copy-v2-banners.mjs and scripts/verify-banners.mjs — repeatable, read-only-source asset recovery and verification.
- public/images/brand/v2/ — 22 byte-identical source variants plus SHA-256 manifest.

There is still no Git repository in this workspace. A targeted pre-edit archive was saved at docs/banner-fix-before/targeted-source.zip. Existing files and the prior redesign report were preserved. No changes were written to v2.

## Screenshots and remaining limitation

- outputs/banner-fix-desktop.jpg — corrected production hero and compact controls.
- outputs/banner-fix-mobile.jpg — centered mobile header and original main campaign.
- outputs/banner-fix-mobile-soft-edit.jpg — restored Soft Edit campaign on mobile.
- outputs/banner-fix-mobile-320.jpg — narrowest requested phone size after clearance correction.
- outputs/banner-fix-full-page.jpg — full desktop homepage including the four original collection cards and editorial.

The pre-existing Sazito SDK HTTP 401 remains unchanged, as previously accepted by the owner. It limits live product/category and purchase-flow testing but does not prevent verification of these original static banners or slider controls. No production deployment was performed. The temporary production server used for checks was stopped; the existing development preview remains on port 3000.
