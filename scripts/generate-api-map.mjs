// Regenerates docs/sazito-api-map.md from src/lib/sazito/routes.json
import { readFileSync, writeFileSync } from "node:fs";
const routes = JSON.parse(readFileSync(new URL("../src/lib/sazito/routes.json", import.meta.url), "utf8"));
const authLabel = { public: "Public", guest: "Guest cookies", user: "JWT required", either: "Guest cookies or JWT", identifier: "Order identifier supplied by caller" };
const modules = [...new Set(routes.map((r) => r.module))];
let md = `# Sazito API map\n\nGenerated from \`src/lib/sazito/routes.json\` (run \`npm run docs:api\`).\nSDK: \`@sazito/client-sdk\` v1.3.3. **Booking is intentionally excluded.**\n\n`;
md += `- Browser code only calls these same-origin routes (DevTools → Network → Fetch/XHR).\n- Each route calls exactly ONE SDK method on the server, with per-request credentials loaded from HttpOnly cookies.\n- "Cache" is the Next.js data-cache revalidate time for public GET calls; "none" means no-store.\n- ${routes.length} routes.\n\n`;
for (const m of modules) {
  md += `## ${m}\n\n| Route | HTTP | SDK method | Upstream (SDK) | Auth | Cache | UI feature |\n|---|---|---|---|---|---|---|\n`;
  for (const r of routes.filter((x) => x.module === m)) {
    md += `| \`${r.path}\` | ${r.method} | \`${r.sdk}\` | ${r.upstream} | ${authLabel[r.auth] ?? r.auth} | ${r.cache} | ${r.ui} |\n`;
  }
  md += "\n";
}
md += `## Not proxied (no remote call)\n\n\`setAuthToken\`, \`getAuthToken\`, \`clearAuth\`, \`isAuthenticated\`, \`clearCache\`, \`clearCredentials\`, \`clearAll\`, \`getCredentialsManager\`, \`cart.clearCart\`, \`invoices.clearInvoice\`, \`shipping.clearAddress\`, \`payments.clearPayment\`, \`searchQuery\`. Their effect is handled by HttpOnly cookie helpers (\`/api/session/logout\`).\n\n## Composite SDK methods handled by the browser as separate requests\n\n\`products.search\` (use \`search.query\`), \`invoices.get\` (= refresh), \`invoices.toggleCredit\` (add/remove credit), \`payments.verify\`, \`payments.pollUntilSettled\` (browser loops \`payments/status\`), \`feedbacks.submitOrderFeedback\` (seed → order-rating → product-review), \`wallet.applyCredit/removeCredit\` (use invoice credit routes), \`shipping.updateAddress\` (legacy), \`booking.*\` (excluded).\n`;
writeFileSync(new URL("../docs/sazito-api-map.md", import.meta.url), md);
console.log("wrote docs/sazito-api-map.md");
