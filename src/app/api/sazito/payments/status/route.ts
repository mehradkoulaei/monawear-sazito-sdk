import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "payments",
  operation: "getPaymentStep",
  method: "GET",
  auth: "either",
  run: ({ client, opts }) =>
    client.payments.getPaymentStep(opts),
});
