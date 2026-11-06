import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, formAttributes, idStr } from "@/lib/sazito/schemas";

const schema = z.object({ cartProductId: idStr, variantId: pos, count: pos, formAttributes: formAttributes.optional(), coupon: z.string().max(50).optional(), deleteCoupon: z.boolean().optional() }).strict();

export const POST = defineRoute({
  module: "cart",
  operation: "updateItem",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.cart.updateItemWithAttributes(input.cartProductId, input.variantId, input.count, { formAttributes: input.formAttributes, coupon: input.coupon, deleteCoupon: input.deleteCoupon }, opts),
});
