import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "general",
  operation: "getInfo",
  method: "GET",
  auth: "public",
  revalidate: 600,
  run: ({ client, opts }) =>
    client.general.getInfo(opts),
});
