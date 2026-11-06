import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ email: z.string().trim().min(3).max(200), password: z.string().min(1).max(200) }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "login",
  method: "POST",
  auth: "public",
  schema,
  run: async ({ client, input, opts, setAuth }) => {
      const r = await client.users.login(input, opts);
      if (r.error) return r;
      setAuth(r.data.jwt); // JWT goes into an HttpOnly cookie and is NEVER returned to the browser
      return { data: { user: r.data.user ?? null } };
    },
});
