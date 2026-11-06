import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, formAttributes } from "@/lib/sazito/schemas";

const schema = z.object({ variantId: pos, count: pos, formAttributes: formAttributes.optional(), coupon: z.string().max(50).optional() }).strict();

export const POST = defineRoute({
  module: "cart",
  operation: "addItem",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.cart.addItemWithAttributes(input.variantId, input.count, { formAttributes: input.formAttributes, coupon: input.coupon }, opts),
});
