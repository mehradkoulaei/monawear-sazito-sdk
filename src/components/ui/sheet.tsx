"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
      {...props}
    />
  ),
);
SheetOverlay.displayName = "SheetOverlay";

// RTL: "start" side = right edge, "end" side = left edge
const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-0 bg-background shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  {
    variants: {
      side: {
        start: "inset-y-0 right-0 h-full w-[88%] max-w-md border-s border-border/80 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        end: "inset-y-0 left-0 h-full w-[88%] max-w-md border-e border-border/80 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        bottom: "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl border-t border-border/80 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
    },
    defaultVariants: { side: "start" },
  },
);

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariants> {
  title: string;
  hideTitle?: boolean;
  headerContent?: React.ReactNode;
}

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side, className, children, title, hideTitle, headerContent, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} aria-describedby={undefined} {...props}>
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5 bg-card/50 backdrop-blur-xs shrink-0">
          {headerContent ? (
            <div className="flex-1 min-w-0 me-3">{headerContent}</div>
          ) : (
            <DialogPrimitive.Title className={cn("text-base font-semibold text-foreground", hideTitle && "sr-only")}>{title}</DialogPrimitive.Title>
          )}
          {headerContent && !hideTitle && <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>}
          <DialogPrimitive.Close
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted hover:text-foreground active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
            aria-label="بستن"
          >
            <X className="h-4.5 w-4.5" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };
