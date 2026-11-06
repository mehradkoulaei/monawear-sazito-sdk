import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ forgotPasswordToken: z.string().min(3).max(500), password: z.string().min(6).max(100), passwordConfirmation: z.string().min(6).max(100) }).strict().refine((v) => v.password === v.passwordConfirmation, { message: "تکرار رمز عبور مطابقت ندارد", path: ["passwordConfirmation"] });

export const POST = defineRoute({
  module: "users",
  operation: "revivePassword",
  method: "POST",
  auth: "public",
  schema,
  run: async ({ client, input, opts, setAuth }) => {
      const r = await client.users.revivePassword(input, opts);
      if (r.error) return r;
      setAuth(r.data.jwt); // JWT goes into an HttpOnly cookie and is NEVER returned to the browser
      return { data: { user: r.data.user ?? null } };
    },
});
