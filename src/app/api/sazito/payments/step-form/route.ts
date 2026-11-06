import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "payments",
  operation: "processStepForm",
  method: "POST",
  auth: "either",
  multipart: true,
  run: ({ client, opts, formData }) =>
    client.payments.processStepForm(formData as FormData, opts),
});
