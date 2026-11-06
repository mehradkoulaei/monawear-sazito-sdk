import { defineRoute } from "@/lib/sazito/route";

export const GET = defineRoute({
  module: "dynamicForms",
  operation: "getForm",
  method: "GET",
  auth: "public",
  revalidate: 600,
  run: ({ client, opts, params }) =>
    (() => {
      const id = Number([params.id].flat()[0]);
      if (!Number.isInteger(id) || id <= 0) return Promise.resolve({ error: { type: "validation" as const, status: 400, message: "شناسه فرم نامعتبر است." } });
      return client.dynamicForms.getForm(id, opts);
    })(),
});
