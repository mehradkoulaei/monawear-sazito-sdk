import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "invoices",
  operation: "create",
  method: "POST",
  auth: "either",
  run: ({ client, opts }) =>
    client.invoices.create(opts),
});
