import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, page, pageSize } from "@/lib/sazito/schemas";

const schema = z.object({ q: z.string().trim().min(1).max(100), page, pageSize, categoryId: pos.optional(), minPrice: z.coerce.number().min(0).optional(), maxPrice: z.coerce.number().min(0).optional() }).strict();

export const GET = defineRoute({
  module: "search",
  operation: "query",
  method: "GET",
  auth: "public",
  revalidate: 60,
  schema,
  run: ({ client, opts, input }) =>
    client.search.query(input.q, { page: input.page, pageSize: input.pageSize, categoryId: input.categoryId, minPrice: input.minPrice, maxPrice: input.maxPrice }, opts),
});
