import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, formAttributes } from "@/lib/sazito/schemas";

const schema = z.object({ coupon: z.string().max(50).optional(), variants: z.array(z.object({ id: pos, count: pos, formAttributes: formAttributes.optional() }).strict()).min(1).max(20), formAttributes: formAttributes.optional() }).strict();

export const POST = defineRoute({
  module: "cart",
  operation: "create",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.cart.create(input, opts),
});
