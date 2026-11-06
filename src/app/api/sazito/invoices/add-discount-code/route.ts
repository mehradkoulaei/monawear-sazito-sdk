import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ code: z.string().trim().min(1).max(50) }).strict();

export const POST = defineRoute({
  module: "invoices",
  operation: "addDiscountCode",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.invoices.addDiscountCode(input.code, opts),
});
