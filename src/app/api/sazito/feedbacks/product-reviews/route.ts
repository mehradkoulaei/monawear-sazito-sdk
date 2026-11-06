import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, page, pageSize } from "@/lib/sazito/schemas";

const schema = z.object({ productId: pos, pageNumber: page, pageSize }).strict();

export const GET = defineRoute({
  module: "feedbacks",
  operation: "getProductReviews",
  method: "GET",
  auth: "public",
  revalidate: 300,
  schema,
  run: ({ client, opts, input }) =>
    client.feedbacks.getProductReviews(input.productId, { pageNumber: input.pageNumber, pageSize: input.pageSize }, opts),
});
