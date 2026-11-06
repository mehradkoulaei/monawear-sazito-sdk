import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { email } from "@/lib/sazito/schemas";

const schema = z.object({ email }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "forgotPassword",
  method: "POST",
  auth: "public",
  schema,
  run: ({ client, opts, input }) =>
    client.users.forgotPassword(input, opts),
});
