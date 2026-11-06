import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ path: z.string().min(1).max(300) }).strict();

export const GET = defineRoute({
  module: "products",
  operation: "get",
  method: "GET",
  auth: "public",
  revalidate: 120,
  schema,
  run: ({ client, opts, input }) =>
    client.products.get(input.path, opts),
});
