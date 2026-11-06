"use client";
import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
interface Toast { id: number; message: string; kind: Kind }
const Ctx = React.createContext<{ toast: (message: string, kind?: Kind) => void }>({ toast: () => {} });
export const useToast = () => React.useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const toast = React.useCallback((message: string, kind: Kind = "info") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-3), { id, message, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[92%] max-w-sm -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cn("pointer-events-auto flex items-start gap-2 rounded-sm border bg-card px-4 py-3 text-sm shadow-lg", t.kind === "error" && "border-destructive/50")}>
            {t.kind === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} aria-label="بستن"><X className="h-4 w-4 opacity-60" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
