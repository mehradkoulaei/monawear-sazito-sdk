import { z } from "zod";
import { defineRoute } from "@/lib/sazito/route";
import { pos, looseJson } from "@/lib/sazito/schemas";

const schema = z.object({ commentId: z.string().min(1).max(100), productId: pos, productVariantId: pos, productRate: z.number().int().min(1).max(5), productName: z.string().max(300).optional(), productAttributes: z.array(looseJson).optional(), productImage: looseJson.optional(), text: z.string().max(2000).optional(), pros: z.array(z.string().max(200)).max(10).optional(), cons: z.array(z.string().max(200)).max(10).optional(), recommendationStatus: z.enum(["RECOMMENDED", "NEUTRAL", "NOT-RECOMMENDED", "NONE"]).optional(), attachmentsServeKeys: z.array(z.string().min(1).max(500)).max(10).optional(), isAnonymous: z.boolean().optional(), owner: z.boolean().optional() }).strict();

export const POST = defineRoute({
  module: "feedbacks",
  operation: "submitProductReview",
  method: "POST",
  auth: "identifier",
  schema,
  run: ({ client, opts, input }) =>
    client.feedbacks.submitProductReview(input as never, opts),
});
