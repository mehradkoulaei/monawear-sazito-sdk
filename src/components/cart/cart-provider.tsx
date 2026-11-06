"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, CartProduct } from "@sazito/client-sdk";
import dynamic from "next/dynamic";
import { errorText, sazitoFetch, type ApiResult } from "@/lib/api/client";
import { useToast } from "@/components/toast";
const AddConfirmation = dynamic(() => import("./add-confirmation").then((module) => module.AddConfirmation));

interface CartCtx {
  cart: Cart | null;
  count: number;
  isLoading: boolean;
  busy: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (variantId: number, count?: number, formAttributes?: Record<string, unknown>) => Promise<boolean>;
  update: (cartProductId: number | string, variantId: number, count: number) => Promise<boolean>;
  remove: (cartProductId: number | string, variantId: number) => Promise<boolean>;
  refresh: () => void;
}
const Ctx = React.createContext<CartCtx | null>(null);
export function useCart() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

const KEY = ["cart"];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<{ item: CartProduct; quantity: number; sequence: number } | null>(null);
  const additionSequence = React.useRef(0);

  const q = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const r = await sazitoFetch<Cart>("cart/get");
      // A missing cart (no credential yet) is simply an empty cart; nothing is invented.
      return r.data ?? null;
    },
  });

  const run = React.useCallback(
    async (fn: () => Promise<ApiResult<Cart>>, okMsg?: string) => {
      setBusy(true);
      const r = await fn();
      setBusy(false);
      if (r.error) {
        toast(errorText(r.error), "error");
        qc.invalidateQueries({ queryKey: KEY });
        return false;
      }
      qc.setQueryData(KEY, r.data);
      if (okMsg) toast(okMsg, "success");
      return true;
    },
    [qc, toast],
  );

  const value: CartCtx = {
    cart: q.data ?? null,
    count: (q.data?.items ?? []).reduce((s, i) => s + i.quantity, 0),
    isLoading: q.isLoading,
    busy,
    open,
    setOpen,
    add: async (variantId, count = 1, formAttributes) => {
      const hasCart = !!q.data;
      const previous = new Map((q.data?.items ?? []).map((item) => [String(item.id), item.quantity]));
      const ok = await run(
        () =>
          hasCart
            ? sazitoFetch<Cart>("cart/add-item", { body: { variantId, count, formAttributes } })
            : sazitoFetch<Cart>("cart/create", { body: { variants: [{ id: variantId, count, formAttributes }] } }),
      );
      if (ok) {
        const updated = qc.getQueryData<Cart>(KEY);
        const added = updated?.items.find((item) => item.productVariantId === variantId && item.quantity > (previous.get(String(item.id)) ?? 0));
        if (added) {
          setOpen(false);
          setConfirmation({ item: added, quantity: added.quantity - (previous.get(String(added.id)) ?? 0), sequence: ++additionSequence.current });
        } else toast("سبد خرید به‌روزرسانی شد", "success");
      }
      return ok;
    },
    update: (id, variantId, count) => run(() => sazitoFetch<Cart>("cart/update-item", { body: { cartProductId: id, variantId, count } })),
    remove: (id, variantId) => run(() => sazitoFetch<Cart>("cart/remove-item", { body: { cartProductId: id, variantId } })),
    refresh: () => qc.invalidateQueries({ queryKey: KEY }),
  };
  return <Ctx.Provider value={value}>{children}{confirmation && <AddConfirmation key={confirmation.sequence} item={confirmation.item} quantity={confirmation.quantity} onClose={() => setConfirmation(null)} />}</Ctx.Provider>;
}
