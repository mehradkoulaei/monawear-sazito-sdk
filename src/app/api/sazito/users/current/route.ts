import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "users",
  operation: "getCurrentUser",
  method: "GET",
  auth: "user",
  run: ({ client, opts }) =>
    client.users.getCurrentUser(opts),
});
