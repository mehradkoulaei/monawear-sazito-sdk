import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, email } from "@/lib/sazito/schemas";

const schema = z.object({ userId: pos, firstName: z.string().max(60).optional(), lastName: z.string().max(60).optional(), email: email.optional(), password: z.string().min(6).max(100).optional(), passwordConfirmation: z.string().min(6).max(100).optional(), birthDate: z.string().max(20).optional() }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "updateProfile",
  method: "POST",
  auth: "user",
  schema,
  run: ({ client, opts, input }) =>
    client.users.updateProfile(input.userId, { firstName: input.firstName, lastName: input.lastName, email: input.email, password: input.password, passwordConfirmation: input.passwordConfirmation, birthDate: input.birthDate }, opts),
});
