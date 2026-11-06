import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ path: z.string().min(1).max(400) }).strict();

export const GET = defineRoute({
  module: "entityRoutes",
  operation: "resolve",
  method: "GET",
  auth: "public",
  revalidate: 600,
  schema,
  run: ({ client, opts, input }) =>
    client.entityRoutes.resolve(input.path, opts),
});
