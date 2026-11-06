import { jsonLd } from "@/lib/seo";
import type { Product } from "@sazito/client-sdk";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductExperience } from "./product-experience";
import { ProductRail } from "./product-rail";
import { RecentlyViewed } from "./recently-viewed";
import { Reviews } from "./reviews";
import { getDynamicForm, getGeneral, getProduct, getSizeGuideHtml, listProducts } from "@/lib/sazito/services";
import { attrValue, splitAttributes, variantAvailable } from "@/lib/product";
import { sanitizeHtml } from "@/lib/sanitize";
import { siteConfig } from "@/config/site";
import { absoluteUrl, toPath } from "@/lib/utils";

export async function ProductPage({ product: routeProduct, productId, path }: { product: Product; productId?: number; path: string }) {
  const formId = routeProduct.dynamicFormId ?? routeProduct.variants?.find((v) => v.dynamicFormId)?.dynamicFormId;
  const [general, form, related, sizeHtml, detail] = await Promise.all([
    getGeneral(),
    formId ? getDynamicForm(formId) : Promise.resolve(null),
    productId ? listProducts({ similarTo: productId, pageSize: 10 }) : Promise.resolve(null),
    getSizeGuideHtml(),
    getProduct(path),
  ]);
  const product = detail.data ?? routeProduct;
  const taxonomy = product.taxonomy;
  const features = taxonomy?.features ?? [];
  const categoryPath = taxonomy?.categoryPath ?? "";
  const { description, specs } = splitAttributes(product.attributes);
  const variants = (product.variants ?? []).filter((v) => v.enabled);
  const availableVariants = variants.filter(variantAvailable);
  const cheapest = [...(availableVariants.length ? availableVariants : variants)].sort((a, b) => a.price - b.price)[0];
  const cats = product.categories ?? [];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: (product.images ?? []).map((i) => i.url),
    sku: cheapest?.sku,
    description: description ? description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) : undefined,
    category: categoryPath || undefined,
    additionalProperty: features.length ? features.map(({ label, value }) => ({
      "@type": "PropertyValue",
      name: label,
      value,
    })) : undefined,
    offers: cheapest ? {
      "@type": "Offer",
      url: absoluteUrl(path),
      price: cheapest.price / siteConfig.priceDivisor * 10,
      priceCurrency: siteConfig.jsonLdCurrency,
      availability: variantAvailable(cheapest) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    } : undefined,
  };

  return (
    <>
      <Breadcrumbs items={[...cats.map((c) => ({ name: c.name, href: toPath(c.url) })), { name: product.name }]} />
      <ProductExperience
        product={product}
        productId={productId}
        path={path}
        form={form?.data ?? null}
        sizeGuideHtml={sizeHtml}
        details={(description || specs.length > 0 || features.length > 0 || categoryPath) && (
        <div className="pdp-details">
          <Accordion type="multiple" defaultValue={description ? ["desc"] : features.length > 0 || categoryPath ? ["taxonomy"] : ["specs"]}>
            {description && <AccordionItem value="desc"><AccordionTrigger>توضیحات محصول</AccordionTrigger><AccordionContent><div className="cms-content text-foreground/80" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} /></AccordionContent></AccordionItem>}
            {(features.length > 0 || categoryPath) && <AccordionItem value="taxonomy"><AccordionTrigger>ویژگی‌ها</AccordionTrigger><AccordionContent>
              {categoryPath && <p className="pdp-taxonomy-path"><span>طبقه‌بندی محصول</span><span>{categoryPath}</span></p>}
              {features.length > 0 && <dl className="pdp-taxonomy-features">
                {features.map(({ label, value }) => <div key={`${label}:${value}`}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>}
            </AccordionContent></AccordionItem>}
            {specs.length > 0 && (
              <AccordionItem value="specs"><AccordionTrigger>مشخصات</AccordionTrigger><AccordionContent>
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {specs.map((a, i) => <div key={i} className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">{a.name}</dt><dd className="text-foreground">{attrValue(a)}</dd></div>)}
                </dl>
              </AccordionContent></AccordionItem>
            )}
          </Accordion>
        </div>
      )}
        showStockNumber={!!general.data?.settings?.showProductStockNumber}
      />
      {productId && general.data?.settings?.tajrobe?.enabled && <Reviews productId={productId} />}
      {related?.data && <ProductRail title="محصولات مشابه" products={related.data.items.filter((p) => p.id !== productId).slice(0, 10)} />}
      <RecentlyViewed excludeId={productId} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
    </>
  );
}
