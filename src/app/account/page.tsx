import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Heart, Package, Wallet } from "lucide-react";
import { AuthForms } from "@/components/account/auth-forms";
import { LogoutButton, ProfileForm } from "@/components/account/profile-form";
import { getCurrentUser } from "@/lib/sazito/services";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "حساب کاربری",
  description: "مدیریت حساب کاربری، مشخصات فردی و آدرس‌های ارسال در پوشاک مونا.",
  path: "/account",
  noIndex: true,
});

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="account-page container py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">ورود / ثبت‌نام</h1>
        <Suspense fallback={null}><AuthForms /></Suspense>
      </div>
    );
  }
  return (
    <div className="account-page container max-w-3xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{user.firstName ? `سلام ${user.firstName}` : "حساب کاربری"}</h1><p className="mt-1 text-sm text-muted-foreground" dir="ltr">{user.mobilePhone || user.email}</p></div>
        <LogoutButton />
      </div>
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders" className="flex items-center gap-3 border bg-card p-5 hover:border-foreground"><Package className="h-5 w-5 text-burgundy" />سفارش‌های من</Link>
        <Link href="/account/wallet" className="flex items-center gap-3 border bg-card p-5 hover:border-foreground"><Wallet className="h-5 w-5 text-burgundy" />کیف پول</Link>
      </div>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Heart className="hidden" />اطلاعات حساب</h2>
      <ProfileForm user={user} />
    </div>
  );
}
