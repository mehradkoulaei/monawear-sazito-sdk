import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "invoices",
  operation: "getApplicableShippingMethods",
  method: "GET",
  auth: "either",
  run: ({ client, opts }) =>
    client.invoices.getApplicableShippingMethods(opts),
});
