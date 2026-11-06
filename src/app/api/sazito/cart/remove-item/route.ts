import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, idStr } from "@/lib/sazito/schemas";

const schema = z.object({ cartProductId: idStr, variantId: pos }).strict();

export const POST = defineRoute({
  module: "cart",
  operation: "removeItem",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.cart.removeItem(input.cartProductId, input.variantId, opts),
});
