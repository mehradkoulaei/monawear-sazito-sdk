"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-24 text-center">
      <h1 className="mb-3 text-2xl font-bold">مشکلی پیش آمد</h1>
      <p className="mb-6 text-muted-foreground">لطفاً دوباره تلاش کنید.</p>
      <Button onClick={reset}>تلاش مجدد</Button>
    </div>
  );
}
