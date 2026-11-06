import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { looseJson } from "@/lib/sazito/schemas";

const schema = z.object({ formAttributes: looseJson }).strict();

export const POST = defineRoute({
  module: "invoices",
  operation: "addForm",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.invoices.addForm({ formAttributes: input.formAttributes as never }, opts),
});
