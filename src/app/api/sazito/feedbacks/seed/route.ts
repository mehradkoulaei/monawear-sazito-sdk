import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ orderIdentifier: z.string().min(1).max(200) }).strict();

export const GET = defineRoute({
  module: "feedbacks",
  operation: "getSeed",
  method: "GET",
  auth: "identifier",
  schema,
  run: ({ client, opts, input }) =>
    client.feedbacks.getSeed(input.orderIdentifier, opts),
});
