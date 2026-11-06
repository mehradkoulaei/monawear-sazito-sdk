import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, iranMobile, email } from "@/lib/sazito/schemas";

const schema = z.object({ firstName: z.string().trim().min(1).max(60), lastName: z.string().trim().min(1).max(60), mobilePhone: iranMobile, phoneNumber: z.string().max(20).optional(), email: email.optional(), regionId: pos, cityId: pos, address: z.string().trim().min(5).max(500), postalCode: z.string({ error: "کد پستی ۱۰ رقمی الزامی است" }).regex(/^\d{10}$/, "کد پستی ۱۰ رقمی الزامی است"), description: z.string().max(500).optional() }).strict();

export const POST = defineRoute({
  module: "shipping",
  operation: "createAddress",
  method: "POST",
  auth: "either",
  schema,
  run: ({ client, opts, input }) =>
    client.shipping.createAddress(input, opts),
});
