import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos } from "@/lib/sazito/schemas";

const schema = z.object({ paymentTypeId: pos }).strict();

export const POST = defineRoute({
  module: "payments",
  operation: "create",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.payments.create(input.paymentTypeId, opts),
});
