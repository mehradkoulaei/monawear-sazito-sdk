import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "wallet",
  operation: "getBalance",
  method: "GET",
  auth: "user",
  run: ({ client, opts }) =>
    client.wallet.getBalance(opts),
});
