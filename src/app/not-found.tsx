import { EmptyState } from "@/components/state";
export default function NotFound() {
  return <div className="container"><EmptyState title="صفحه مورد نظر پیدا نشد" text="ممکن است آدرس تغییر کرده باشد." href="/" cta="بازگشت به خانه" /></div>;
}
