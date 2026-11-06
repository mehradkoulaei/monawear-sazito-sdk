# Brand assets

The local storefront uses seven existing assets from the v2 public/media directory: the original Mona logo, satin hero, ivory editorial and four collection photographs. One AI-generated accessories still life completes the editorial gallery. It is campaign artwork, not product inventory. The original v2 files are unchanged.

All eight final assets are in public/images/brand as WebP. See manifest.json in that directory for provenance, dimensions and exact byte sizes. The combined optimized size is 368,648 bytes, down from 3,059,482 bytes (88% smaller). The seven reused assets alone decreased from 502,873 to 283,964 bytes (44% smaller).

Text remains HTML. Hero layout separates text from photography on desktop and stacks them on mobile. Only the first hero and logo have priority loading. Other images are lazy loaded through next/image with responsive sizes. The header and footer use the local logo independently of the Sazito connection.

To regenerate the compressed files:

    node scripts/prepare-brand-assets.mjs <v2-public-media-directory> [generated-accessories-source.png]

The optional original generated image stays outside the public directory; only the compressed WebP is served. If the optional argument is omitted, an existing generated WebP and its manifest entry are retained.

Validation: TypeScript passed; homepage and all eight asset URLs returned HTTP 200; the Next.js image optimizer returned a resized hero successfully. Browser layout was not inspected. Sazito product authorization remains a separate issue.
