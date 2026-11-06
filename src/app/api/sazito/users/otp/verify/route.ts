import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { iranMobile, otpToken } from "@/lib/sazito/schemas";

const schema = z.object({ mobilePhone: iranMobile, token: otpToken }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "verifyMobileOTP",
  method: "POST",
  auth: "public",
  schema,
  run: async ({ client, input, opts, setAuth }) => {
      const r = await client.users.verifyMobileOTP(input, opts);
      if (r.error) return r;
      setAuth(r.data.jwt); // JWT goes into an HttpOnly cookie and is NEVER returned to the browser
      return { data: { user: r.data.user ?? null } };
    },
});
