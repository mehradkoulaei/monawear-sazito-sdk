import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { looseJson } from "@/lib/sazito/schemas";

const schema = z.object({ payload: looseJson.optional(), tatoken: z.string().max(500).optional(), trackingData: looseJson.optional(), isFailed: z.string().max(20).optional(), imageUrl: z.string().max(1000).optional(), code: z.string().max(50).optional() }).strict();

export const POST = defineRoute({
  module: "payments",
  operation: "processStep",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.payments.processStep(input as never, opts),
});
