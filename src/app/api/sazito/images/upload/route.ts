import { defineRoute } from "@/lib/sazito/route";
import { siteConfig } from "@/config/site";

export const POST = defineRoute({
  module: "images",
  operation: "upload",
  method: "POST",
  auth: "user",
  multipart: true,
  run: ({ client, opts, formData }) =>
    siteConfig.featureFlags.imageAdminRoutes ? (() => {
        const file = formData?.get("image");
        if (!(file instanceof File) || file.size === 0) return Promise.resolve({ error: { type: "validation" as const, status: 400, message: "تصویر معتبر ارسال نشده است." } });
        return client.images.upload(file, opts);
      })() : Promise.resolve({ error: { type: "api" as const, status: 403, message: "این مسیر به‌صورت پیش‌فرض غیرفعال است (siteConfig.featureFlags.imageAdminRoutes)." } }),
});
