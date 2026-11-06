import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "visits",
  operation: "track",
  method: "POST",
  auth: "either",
  run: ({ client, opts }) =>
    client.visits.track(undefined, opts),
});
