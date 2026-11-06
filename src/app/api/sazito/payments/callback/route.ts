import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { idStr, looseJson } from "@/lib/sazito/schemas";

const schema = z.object({ paymentId: idStr, paymentIdentifier: z.string().min(1).max(200), body: looseJson.optional(), query: looseJson.optional() }).strict();

export const POST = defineRoute({
  module: "payments",
  operation: "verifyPaymentCallback",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.payments.verifyPaymentCallback(input as never, opts),
});
