import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "regions",
  operation: "list",
  method: "GET",
  auth: "public",
  revalidate: 3600,
  run: ({ client, opts }) =>
    client.regions.list(opts),
});
