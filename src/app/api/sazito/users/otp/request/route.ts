import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { iranMobile } from "@/lib/sazito/schemas";

const schema = z.object({ mobilePhone: iranMobile }).strict();

export const POST = defineRoute({
  module: "users",
  operation: "requestMobileOTP",
  method: "POST",
  auth: "public",
  schema,
  run: ({ client, opts, input }) =>
    client.users.requestMobileOTP(input, opts),
});
