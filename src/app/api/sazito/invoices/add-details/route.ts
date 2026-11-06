import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ comment: z.string().max(1000) }).strict();

export const POST = defineRoute({
  module: "invoices",
  operation: "addDetails",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.invoices.addDetails(input.comment, opts),
});
