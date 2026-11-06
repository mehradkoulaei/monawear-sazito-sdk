import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "invoices",
  operation: "addCredit",
  method: "POST",
  auth: "user",
  run: ({ client, opts }) =>
    client.invoices.addCredit(opts),
});
