import { defineRoute } from "@/lib/sazito/route";

export const POST = defineRoute({
  module: "feedbacks",
  operation: "uploadReviewImages",
  method: "POST",
  auth: "either",
  multipart: true,
  run: ({ client, opts, formData }) =>
    (() => {
      const files = (formData?.getAll("images") ?? []).filter((f): f is File => f instanceof File && f.size > 0).slice(0, 5);
      if (files.length === 0) return Promise.resolve({ error: { type: "validation" as const, status: 400, message: "تصویر معتبر ارسال نشده است." } });
      return client.feedbacks.uploadReviewImages(files.map((f) => ({ file: f, name: f.name })), opts);
    })(),
});
