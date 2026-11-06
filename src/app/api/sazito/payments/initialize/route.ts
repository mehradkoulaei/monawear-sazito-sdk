import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "payments",
  operation: "initialize",
  method: "POST",
  auth: "either",
  run: ({ client, opts }) =>
    client.payments.initialize(opts),
});
