import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "cms",
  operation: "getPage",
  method: "GET",
  auth: "public",
  revalidate: 600,
  run: ({ client, opts, params }) =>
    client.cms.getPage("/" + [params.path ?? []].flat().join("/"), opts),
});
