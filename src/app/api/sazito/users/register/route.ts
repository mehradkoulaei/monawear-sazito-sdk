import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { iranMobile, email } from "@/lib/sazito/schemas";

const schema = z.object({ email, password: z.string().min(6).max(100), passwordConfirmation: z.string().min(6).max(100), firstName: z.string().max(60).optional(), lastName: z.string().max(60).optional(), mobilePhone: iranMobile.optional() }).strict().refine((v) => v.password === v.passwordConfirmation, { message: "تکرار رمز عبور مطابقت ندارد", path: ["passwordConfirmation"] });

export const POST = defineRoute({
  module: "users",
  operation: "register",
  method: "POST",
  auth: "public",
  schema,
  run: ({ client, opts, input }) =>
    client.users.register(input, opts),
});
