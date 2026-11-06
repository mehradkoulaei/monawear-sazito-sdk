import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ idOrSlug: z.string().min(1).max(200) }).strict();

export const GET = defineRoute({
  module: "categories",
  operation: "get",
  method: "GET",
  auth: "public",
  revalidate: 600,
  schema,
  run: ({ client, opts, input }) =>
    client.categories.get(input.idOrSlug, opts),
});
