import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ shippingAddressId: z.coerce.number().int().min(0), shippingAddressIdentifier: z.string().min(1).max(200) }).strict();

export const POST = defineRoute({
  module: "invoices",
  operation: "addShippingAddress",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.invoices.addShippingAddress(input.shippingAddressId, input.shippingAddressIdentifier, opts),
});
