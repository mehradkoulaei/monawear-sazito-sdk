"use client";
import * as React from "react";
import type { DynamicForm, DynamicFormField } from "@sazito/client-sdk";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sazitoFetch } from "@/lib/api/client";

export type FormValues = Record<string, string | number | boolean | null | { serveKey: string; fileName: string }>;

export function validateForm(form: DynamicForm, values: FormValues): string | null {
  for (const f of form.fields) {
    if (f.type === "Separator" || !f.required) continue;
    const v = values[f.key];
    if (v === undefined || v === null || v === "" || v === false) return `«${f.label || f.name}» الزامی است.`;
  }
  return null;
}

export function DynamicFormFields({ form, values, onChange }: { form: DynamicForm; values: FormValues; onChange: (v: FormValues) => void }) {
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [err, setErr] = React.useState("");
  const set = (k: string, v: FormValues[string]) => onChange({ ...values, [k]: v });

  const upload = async (f: DynamicFormField, file: File | undefined) => {
    if (!file) return;
    setUploading(f.key); setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await sazitoFetch<{ serveKey: string }>("dynamic-forms/upload-product-file", { formData: fd });
    setUploading(null);
    if (r.error) return setErr(r.error.message);
    set(f.key, { serveKey: r.data.serveKey, fileName: file.name });
  };

  return (
    <div className="space-y-4 border p-4">
      {form.title && <h3 className="text-sm font-semibold">{form.title}</h3>}
      {form.description && <p className="text-xs text-muted-foreground">{form.description}</p>}
      {form.fields.map((f) => {
        const id = `df-${f.key}`;
        const label = <Label htmlFor={id}>{f.label || f.name}{f.required && <span className="text-destructive"> *</span>}</Label>;
        const val = values[f.key];
        switch (f.type) {
          case "Separator": return <hr key={f.key} />;
          case "TextArea": return <div key={f.key} className="space-y-1.5">{label}<Textarea id={id} placeholder={f.placeholder} value={(val as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} /></div>;
          case "Select": return (
            <div key={f.key} className="space-y-1.5">{label}
              <Select id={id} value={(val as string) ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">انتخاب کنید</option>
                {f.inputOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          );
          case "Checkbox":
          case "StatusBox": return <label key={f.key} className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={!!val} onChange={(e) => set(f.key, e.target.checked)} />{f.label || f.name}</label>;
          case "Uploader": return (
            <div key={f.key} className="space-y-1.5">{label}
              <Input id={id} type="file" accept={f.allowedExtensions?.map((x) => `.${x.replace(/^\./, "")}`).join(",")} onChange={(e) => upload(f, e.target.files?.[0])} />
              {uploading === f.key && <p className="text-xs text-muted-foreground">در حال بارگذاری…</p>}
              {val && typeof val === "object" && <p className="text-xs text-burgundy">{val.fileName}</p>}
            </div>
          );
          default: return (
            <div key={f.key} className="space-y-1.5">{label}
              <Input id={id} type={f.type === "Number" ? "number" : f.type === "Password" ? "password" : "text"} inputMode={f.type === "NationalId" || f.type === "PhoneNumber" ? "numeric" : undefined} placeholder={f.placeholder} value={(val as string) ?? ""} onChange={(e) => set(f.key, f.type === "Number" ? Number(e.target.value) : e.target.value)} />
            </div>
          );
        }
      })}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
