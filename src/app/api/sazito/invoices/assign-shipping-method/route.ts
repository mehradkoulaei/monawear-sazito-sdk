import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, idStr } from "@/lib/sazito/schemas";

const schema = z.object({ shippings: z.array(z.object({ rateId: pos, invoiceItemIds: z.array(idStr).min(1) }).strict()).min(1) }).strict();

export const POST = defineRoute({
  module: "invoices",
  operation: "assignShippingMethod",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.invoices.assignShippingMethod(input.shippings, opts),
});
