import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { page, pageSize } from "@/lib/sazito/schemas";

const schema = z.object({ page, pageSize }).strict();

export const GET = defineRoute({
  module: "cms",
  operation: "listPages",
  method: "GET",
  auth: "public",
  revalidate: 600,
  schema,
  run: ({ client, opts, input }) =>
    client.cms.listPages(input, opts),
});
