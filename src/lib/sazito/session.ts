import "server-only";
import { MemoryStorage } from "@sazito/client-sdk";

/** HttpOnly cookie names holding the SDK's guest/checkout credentials. */
export const COOKIES = {
  auth: "mw_auth",
  cart: "mw_cart",
  invoice: "mw_invoice",
  ship: "mw_ship",
  pay: "mw_pay",
  discount: "mw_discount",
  result: "mw_result",
} as const;

/** Mapping cookie → the SDK CredentialsManager storage key (verified in SDK v1.3.3). */
export const CREDENTIAL_KEYS: Record<string, string> = {
  [COOKIES.cart]: "CART_CREDENTIALS",
  [COOKIES.invoice]: "INVOICE_CREDENTIALS",
  [COOKIES.ship]: "SHIPPING_ADDRESS_CREDENTIALS",
  [COOKIES.pay]: "PAYMENT_CREDENTIALS",
  [COOKIES.discount]: "DISCOUNT_CODE_INFO",
};

const DAY = 60 * 60 * 24;
export const COOKIE_MAX_AGE: Record<string, number> = {
  [COOKIES.auth]: DAY * 30,
  [COOKIES.cart]: DAY * 30,
  [COOKIES.invoice]: DAY * 2,
  [COOKIES.ship]: DAY * 2,
  [COOKIES.pay]: DAY,
  [COOKIES.discount]: DAY * 2,
  [COOKIES.result]: 60 * 10,
};

export function cookieOptions(name: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE[name] ?? DAY,
  };
}

export interface Session {
  jwt: string | null;
  storage: MemoryStorage;
  /** raw cookie values as received, to detect changes after the SDK call */
  initial: Record<string, string | null>;
}

type CookieReader = { get(name: string): { value: string } | undefined };

export function readSession(cookies: CookieReader): Session {
  const storage = new MemoryStorage();
  const initial: Record<string, string | null> = {};
  for (const [cookieName, key] of Object.entries(CREDENTIAL_KEYS)) {
    const v = cookies.get(cookieName)?.value ?? null;
    initial[cookieName] = v;
    if (v) storage.setItem(key, v);
  }
  const jwt = cookies.get(COOKIES.auth)?.value || null;
  return { jwt, storage, initial };
}

/** Computes which credential cookies changed during the SDK call. */
export function diffSession(session: Session): Array<{ name: string; value: string | null }> {
  const changes: Array<{ name: string; value: string | null }> = [];
  for (const [cookieName, key] of Object.entries(CREDENTIAL_KEYS)) {
    const now = session.storage.getItem(key);
    if (now !== session.initial[cookieName]) changes.push({ name: cookieName, value: now });
  }
  return changes;
}
