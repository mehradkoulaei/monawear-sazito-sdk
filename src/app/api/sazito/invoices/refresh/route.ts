import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "invoices",
  operation: "refresh",
  method: "POST",
  auth: "either",
  run: ({ client, opts }) =>
    client.invoices.refresh(opts),
});
