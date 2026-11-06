import { defineRoute } from "@/lib/sazito/route";
import { productListQuery } from "@/lib/sazito/schemas";

const schema = productListQuery;

export const GET = defineRoute({
  module: "products",
  operation: "list",
  method: "GET",
  auth: "public",
  revalidate: 120,
  schema,
  run: ({ client, opts, input }) =>
    client.products.list(input, opts),
});
