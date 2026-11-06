import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";

const schema = z.object({ identifier: z.string().min(1).max(60).optional() }).strict();

export const GET = defineRoute({
  module: "menu",
  operation: "getHeaderMenu",
  method: "GET",
  auth: "public",
  revalidate: 600,
  schema,
  run: ({ client, opts, input }) =>
    client.menu.getHeaderMenu(input.identifier, opts),
});
