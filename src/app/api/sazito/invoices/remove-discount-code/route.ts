import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "invoices",
  operation: "removeDiscountCode",
  method: "POST",
  auth: "either",
  run: async ({ client, opts }) => {
    // 1. Reset discount code on the invoice in Sazito backend by submitting an empty discount code
    const resetRes = await client.invoices.addDiscountCode("", opts);

    // 2. Clear discount code credential from session storage (deletes mw_discount cookie)
    client.getCredentialsManager().clearDiscountCode();

    // 3. Also clear coupon at cart level if cart has items
    try {
      const cartRes = await client.cart.get(opts);
      if (cartRes.data && cartRes.data.items && cartRes.data.items.length > 0) {
        const item = cartRes.data.items[0];
        await client.cart.updateItemWithAttributes(
          item.id,
          item.productVariantId,
          item.quantity,
          { deleteCoupon: true },
          opts,
        );
      }
    } catch {
      // Non-fatal if cart level update is omitted
    }

    // 4. Return the reset invoice. Fallback to refresh if needed.
    if (resetRes.data) {
      return resetRes;
    }

    return client.invoices.refresh(opts);
  },
});
