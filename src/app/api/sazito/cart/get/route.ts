import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "cart",
  operation: "get",
  method: "GET",
  auth: "either",
  run: ({ client, opts }) =>
    client.cart.get(opts),
});
