import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { iranMobile, otpToken } from "@/lib/sazito/schemas";

const schema = z.object({ mobilePhone: iranMobile, token: otpToken }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "verifyMobilePhoneUpdate",
  method: "POST",
  auth: "user",
  schema,
  run: ({ client, opts, input }) =>
    client.users.verifyMobilePhoneUpdate(input, opts),
});
