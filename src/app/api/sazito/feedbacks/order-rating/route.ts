import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos } from "@/lib/sazito/schemas";

const schema = z.object({ orderId: pos, orderIdentifier: z.string().min(1).max(200), orderRate: z.number().int().min(1).max(5) }).strict();

export const POST = defineRoute({
  module: "feedbacks",
  operation: "createOrderRating",
  method: "POST",
  auth: "identifier",
  schema,
  run: ({ client, opts, input }) =>
    client.feedbacks.createOrderRating(input, opts),
});
