import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { page, pageSize } from "@/lib/sazito/schemas";

const schema = z.object({ pageNumber: page, pageSize }).strict();

export const GET = defineRoute({
  module: "orders",
  operation: "list",
  method: "GET",
  auth: "user",
  schema,
  run: ({ client, opts, input }) =>
    client.orders.list(input, opts),
});
