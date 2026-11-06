import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ orderId: z.string().min(1).max(50), orderIdentifier: z.string().min(1).max(200) }).strict();

export const GET = defineRoute({
  module: "orders",
  operation: "get",
  method: "GET",
  auth: "identifier",
  schema,
  run: ({ client, opts, input }) =>
    client.orders.get(input.orderId, input.orderIdentifier, opts),
});
