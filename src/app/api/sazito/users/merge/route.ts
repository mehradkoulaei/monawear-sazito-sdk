import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "users",
  operation: "mergeUser",
  method: "POST",
  auth: "user",
  run: ({ client, opts }) =>
    client.users.mergeUser(opts),
});
