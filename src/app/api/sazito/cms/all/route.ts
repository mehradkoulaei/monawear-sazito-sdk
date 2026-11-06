import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { page, pageSize } from "@/lib/sazito/schemas";

const schema = z.object({ page, pageSize, type: z.enum(["normal", "blog"]).optional() }).strict();

export const GET = defineRoute({
  module: "cms",
  operation: "listAll",
  method: "GET",
  auth: "public",
  revalidate: 600,
  schema,
  run: ({ client, opts, input }) =>
    client.cms.listAll({ page: input.page, pageSize: input.pageSize, cmsPageTypes: input.type }, opts),
});
