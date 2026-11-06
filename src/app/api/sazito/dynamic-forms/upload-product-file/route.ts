import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "dynamicForms",
  operation: "uploadProductFormFile",
  method: "POST",
  auth: "either",
  multipart: true,
  run: ({ client, opts, formData }) =>
    (() => {
      const file = formData?.get("file");
      if (!(file instanceof File) || file.size === 0) return Promise.resolve({ error: { type: "validation" as const, status: 400, message: "فایل معتبر ارسال نشده است." } });
      return client.dynamicForms.uploadProductFormFile(file, opts);
    })(),
});
