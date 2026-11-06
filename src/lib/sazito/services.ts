import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { ProductFilters, ProductListItem, ProductTaxonomyFacet, SazitoError } from "@sazito/client-sdk";
import { callAuthed, callPublic } from "./client";
import { COOKIES } from "./session";
import {
  PAGE_SIZE,
  hasNativeTaxonomyFilter,
  filterByTaxonomy,
  toFilters,
  type ListingState,
} from "@/lib/listing";

export async function getJwt(): Promise<string | null> {
  return (await cookies()).get(COOKIES.auth)?.value || null;
}

export const getGeneral = cache(() => callPublic("general.getInfo", (c, o) => c.general.getInfo(o), 600));
export const getRegions = cache(() => callPublic("regions.list", (c, o) => c.regions.list(o), 86400));
export const getHeaderMenu = cache(() => callPublic("menu.getHeaderMenu", (c, o) => c.menu.getHeaderMenu(undefined, o), 600));
export const getCategories = cache(() => callPublic("categories.list", (c, o) => c.categories.list({ pageSize: 100 }, o), 600));
export const getCmsPages = cache(() => callPublic("cms.listPages", (c, o) => c.cms.listPages({ pageSize: 50 }, o), 600));

/**
 * Product list. NOTE (SDK v1.3.3 behaviour verified in source): the SDK adds the `in_stock` filter only when
 * `availableOnly === false`, so "only in stock" is requested with `availableOnly: false`. Verify against live data.
 */
export function listProducts(filters: ProductFilters, revalidate = 120) {
  return callPublic("products.list", (c, o) => c.products.list(filters, o), revalidate);
}

export interface ListingProductsResult {
  items: ProductListItem[];
  total: number;
  taxonomyFacets?: ProductTaxonomyFacet[];
  error?: SazitoError;
}

/**
 * High-level product fetcher for category/search pages.
 * Supports native upstream taxonomy filters (@sazito/client-sdk@1.5.0) with accurate backend pagination
 * and dynamic taxonomy facets. Falls back to in-memory filtering only for legacy text-based filters.
 */
export async function getListingProducts(
  state: ListingState,
  categoryId?: number
): Promise<ListingProductsResult> {
  const isNativeTaxonomy = hasNativeTaxonomyFilter(state);
  const isLegacyTaxonomy = !isNativeTaxonomy && Boolean(state.size || state.color || state.pattern);

  // If native taxonomy or standard filters, let Sazito API handle filtering and pagination natively
  if (!isLegacyTaxonomy) {
    const res = await listProducts(toFilters(state, categoryId, PAGE_SIZE, state.page));
    if (res.error) {
      return { items: [], total: 0, error: res.error };
    }
    return {
      items: res.data?.items ?? [],
      total: res.data?.total ?? 0,
      taxonomyFacets: res.data?.taxonomyFacets ?? [],
    };
  }

  // Legacy in-memory fallback when only legacy text attributes (size/color/pattern) are specified
  const page1Res = await listProducts(toFilters(state, categoryId, 100, 1));
  if (page1Res.error) {
    return { items: [], total: 0, error: page1Res.error };
  }

  let allItems = page1Res.data?.items ?? [];
  const totalAvailable = page1Res.data?.total ?? allItems.length;

  if (totalAvailable > 100) {
    const totalPages = Math.min(10, Math.ceil(totalAvailable / 100));
    const restPromises = [];
    for (let p = 2; p <= totalPages; p++) {
      restPromises.push(listProducts(toFilters(state, categoryId, 100, p)));
    }
    const restResults = await Promise.all(restPromises);
    for (const r of restResults) {
      if (r.data?.items) {
        allItems = allItems.concat(r.data.items);
      }
    }
  }

  const filtered = filterByTaxonomy(allItems, {
    size: state.size,
    color: state.color,
    pattern: state.pattern,
  });

  const total = filtered.length;
  const startIndex = (state.page - 1) * PAGE_SIZE;
  const paginatedItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return {
    items: paginatedItems,
    total,
    taxonomyFacets: page1Res.data?.taxonomyFacets ?? [],
  };
}
export const resolveRoute = cache((path: string) =>
  callPublic("entityRoutes.resolve", (c, o) => c.entityRoutes.resolve(path, o), 300)
);
/** Taxonomy is only returned by product details, never by entity-route resolution. */
export const getProduct = cache((path: string) => callPublic("products.get", (c, o) => c.products.get(path, o), 120));
export function searchSite(q: string, f: { page?: number; pageSize?: number; categoryId?: number; minPrice?: number; maxPrice?: number }) {
  return callPublic("search.query", (c, o) => c.search.query(q, f, o), 60);
}
export function getCmsPage(path: string) {
  return callPublic("cms.getPage", (c, o) => c.cms.getPage(path, o), 600);
}
export function getDynamicForm(id: number) {
  return callPublic("dynamicForms.getForm", (c, o) => c.dynamicForms.getForm(id, o), 600);
}
export function getProductStatistics(id: number) {
  return callPublic("feedbacks.getProductStatistics", (c, o) => c.feedbacks.getProductStatistics(id, o), 300);
}
export function getProductReviews(id: number, pageNumber = 1) {
  return callPublic("feedbacks.getProductReviews", (c, o) => c.feedbacks.getProductReviews(id, { pageNumber, pageSize: 10 }, o), 300);
}

/** Authenticated server-side reads (JWT from the HttpOnly cookie). */
export async function getCurrentUser() {
  const jwt = await getJwt();
  if (!jwt) return null;
  const r = await callAuthed("users.getCurrentUser", jwt, (c, o) => c.users.getCurrentUser(o));
  return r.data ?? null;
}
export async function listMyOrders(pageNumber = 1) {
  const jwt = await getJwt();
  if (!jwt) return null;
  return callAuthed("orders.list", jwt, (c, o) => c.orders.list({ pageNumber, pageSize: 10 }, o));
}
export async function getMyOrder(id: string, identifier: string) {
  const jwt = await getJwt();
  if (!jwt) return null;
  return callAuthed("orders.get", jwt, (c, o) => c.orders.get(id, identifier, o));
}
export async function getMyWallet() {
  const jwt = await getJwt();
  if (!jwt) return null;
  const [balance, tx] = await Promise.all([
    callAuthed("wallet.getBalance", jwt, (c, o) => c.wallet.getBalance(o)),
    callAuthed("wallet.listTransactions", jwt, (c, o) => c.wallet.listTransactions({ pageSize: 20 }, o)),
  ]);
  return { balance, tx };
}

import { sanitizeHtml } from "@/lib/sanitize";
import { siteConfig } from "@/config/site";

/** Size guide content from a real CMS page (path configurable in siteConfig). Returns "" when none exists. */
export async function getSizeGuideHtml(): Promise<string> {
  const r = await getCmsPage(siteConfig.sizeGuideCmsPath);
  const content = r.data?.content;
  return content ? sanitizeHtml(content) : "";
}

/** Order lookup: uses the customer's JWT when present, otherwise the order identifier alone (guest tracking, unverified). */
export async function getOrderByIdentifier(id: string, identifier: string) {
  const jwt = await getJwt();
  return jwt
    ? callAuthed("orders.get", jwt, (c, o) => c.orders.get(id, identifier, o))
    : callPublic("orders.get", (c, o) => c.orders.get(id, identifier, o), false);
}
