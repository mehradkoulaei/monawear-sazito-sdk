"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    hideTitle?: boolean;
    overlayClassName?: string;
  }
>(({ className, children, title, hideTitle, overlayClassName, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-charcoal/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        overlayClassName
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid max-h-[90vh] w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto bg-background p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Title className={cn("text-lg font-semibold", hideTitle && "sr-only")}>{title}</DialogPrimitive.Title>
      {children}
      <DialogPrimitive.Close className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-foreground/75 backdrop-blur-xs transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40" aria-label="بستن">
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export { Dialog, DialogTrigger, DialogClose, DialogContent };
