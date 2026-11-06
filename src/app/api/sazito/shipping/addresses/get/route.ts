import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "shipping",
  operation: "getAddress",
  method: "GET",
  auth: "either",
  run: async ({ client, opts }) => {
    try {
      const res = await client.shipping.getAddress(opts);
      if (res.error && (res.error.status === 404 || res.error.status === 405)) {
        return { data: null };
      }
      return res;
    } catch {
      return { data: null };
    }
  },
});
