import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "payments",
  operation: "getMethods",
  method: "GET",
  auth: "either",
  run: ({ client, opts }) =>
    client.payments.getMethods(opts),
});
