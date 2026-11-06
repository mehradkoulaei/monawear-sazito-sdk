import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "cms",
  operation: "getBlogPost",
  method: "GET",
  auth: "public",
  revalidate: 600,
  run: ({ client, opts, params }) =>
    client.cms.getBlogPost("/" + [params.path ?? []].flat().join("/"), opts),
});
