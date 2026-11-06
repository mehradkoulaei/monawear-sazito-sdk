import { z } from "zod";

/** Shared Zod pieces. Every object schema is .strict() so booking attributes are REJECTED. */
export const pos = z.coerce.number().int().positive();
export const page = z.coerce.number().int().min(1).max(500).optional();
export const pageSize = z.coerce.number().int().min(1).max(100).optional();
export const formAttr = z.union([
  z.string().max(2000),
  z.number(),
  z.boolean(),
  z.null(),
  z.object({ serveKey: z.string().max(500), fileName: z.string().max(300) }).strict(),
]);
export const formAttributes = z.record(z.string().max(100), formAttr);
const csvNumbers = z
  .string()
  .max(200)
  .transform((s) => s.split(",").map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0));

export const sortEnum = z.enum(["newest", "best-selling", "availability", "discount", "!price", "price"]);

const taxonomyRecord = z.record(z.string(), z.union([z.string(), z.array(z.string())]));
export const taxonomyQuery = z.union([
  z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const res = taxonomyRecord.safeParse(parsed);
      if (res.success) return res.data;
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid taxonomy format" });
      return z.NEVER;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON for taxonomy" });
      return z.NEVER;
    }
  }),
  taxonomyRecord,
]);

export const productListQuery = z
  .object({
    page,
    pageSize,
    sort: sortEnum.optional(),
    categories: csvNumbers.optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    availableOnly: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    discountedOnly: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    pinnedIds: csvNumbers.optional(),
    similarTo: pos.optional(),
    taxonomy: taxonomyQuery.optional(),
  })
  .strict();

export const iranMobile = z
  .string()
  .trim()
  .transform((s) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))))
  .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"));

const toEn = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
export const otpToken = z.string().trim().transform(toEn).pipe(z.string().regex(/^\d{3,10}$/, "کد تأیید معتبر نیست"));
export const email = z.string().trim().min(5).max(200).email("ایمیل معتبر نیست");
export const idStr = z.union([z.string().min(1).max(100), z.number()]);
export const looseJson = z.record(z.string(), z.any());
