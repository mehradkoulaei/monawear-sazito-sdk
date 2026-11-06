import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "shipping",
  operation: "getMethods",
  method: "GET",
  auth: "public",
  revalidate: 600,
  run: ({ client, opts }) =>
    client.shipping.getMethods(opts),
});
