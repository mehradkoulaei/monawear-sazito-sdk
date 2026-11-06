import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos } from "@/lib/sazito/schemas";

const schema = z.object({ productId: pos }).strict();

export const GET = defineRoute({
  module: "feedbacks",
  operation: "getProductStatistics",
  method: "GET",
  auth: "public",
  revalidate: 300,
  schema,
  run: ({ client, opts, input }) =>
    client.feedbacks.getProductStatistics(input.productId, opts),
});
