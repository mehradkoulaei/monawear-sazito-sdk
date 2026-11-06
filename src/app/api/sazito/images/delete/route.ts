import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos } from "@/lib/sazito/schemas";
import { siteConfig } from "@/config/site";

const schema = z.object({ imageId: pos }).strict();

export const DELETE = defineRoute({
  module: "images",
  operation: "delete",
  method: "DELETE",
  auth: "user",
  schema,
  run: ({ client, opts, input }) =>
    siteConfig.featureFlags.imageAdminRoutes ? client.images.delete(input.imageId, opts) : Promise.resolve({ error: { type: "api" as const, status: 403, message: "این مسیر به‌صورت پیش‌فرض غیرفعال است (siteConfig.featureFlags.imageAdminRoutes)." } }),
});
