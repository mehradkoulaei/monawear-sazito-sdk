import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "invoices",
  operation: "removeCredit",
  method: "POST",
  auth: "user",
  run: ({ client, opts }) =>
    client.invoices.removeCredit(opts),
});
