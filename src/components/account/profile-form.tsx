"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@sazito/client-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorText, sazitoFetch } from "@/lib/api/client";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [f, setF] = React.useState({ firstName: user.firstName ?? "", lastName: user.lastName ?? "", email: user.email ?? "" });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.id) return;
    setBusy(true); setMsg(null);
    const r = await sazitoFetch("users/update-profile", { body: { userId: user.id, firstName: f.firstName || undefined, lastName: f.lastName || undefined, email: f.email || undefined } });
    setBusy(false);
    if (r.error) return setMsg({ ok: false, text: errorText(r.error) });
    setMsg({ ok: true, text: "اطلاعات ذخیره شد." });
    router.refresh();
  };
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="pfn">نام</Label><Input id="pfn" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></div>
      <div><Label htmlFor="pln">نام خانوادگی</Label><Input id="pln" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label htmlFor="pem">ایمیل</Label><Input id="pem" type="email" dir="ltr" className="text-end" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div className="sm:col-span-2 flex items-center gap-4"><Button type="submit" disabled={busy}>ذخیره</Button>{msg && <span className={msg.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{msg.text}</span>}</div>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={async () => { await fetch("/api/session/logout", { method: "POST" }); router.push("/"); router.refresh(); window.location.reload(); }}>خروج از حساب</Button>
  );
}
