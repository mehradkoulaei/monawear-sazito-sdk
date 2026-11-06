import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "shipping",
  operation: "listAddresses",
  method: "GET",
  auth: "user",
  run: async ({ client, opts }) => {
    try {
      const res = await client.shipping.listAddresses(opts);
      if (res.error) {
        // Upstream Sazito returns 405 Method Not Allowed because GET /api/v2/shipping_addresses
        // is not implemented on the server. Return empty address list gracefully.
        if (res.error.status === 405 || res.error.status === 404 || res.error.status === 400) {
          return { data: [] };
        }
      }
      return res;
    } catch {
      return { data: [] };
    }
  },
});
