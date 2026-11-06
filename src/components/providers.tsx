"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/components/cart/cart-provider";
import { ToastProvider } from "@/components/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
