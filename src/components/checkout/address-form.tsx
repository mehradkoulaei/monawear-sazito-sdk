"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { RegionWithCities } from "@sazito/client-sdk";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressPicker } from "./address-picker";

export interface AddressValues {
  firstName: string; lastName: string; mobilePhone: string; email?: string;
  regionId: number; cityId: number; address: string; postalCode: string; description?: string;
}

export const CHECKOUT_ADDRESS_STORAGE_KEY = "monawear_checkout_address_cache";

export interface CachedAddressData {
  firstName?: string;
  lastName?: string;
  mobilePhone?: string;
  email?: string;
  regionId?: number;
  cityId?: number;
  address?: string;
  postalCode?: string;
  description?: string;
}

export function loadAddressCache(): CachedAddressData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as CachedAddressData;
  } catch {}
  return null;
}

export function saveAddressCache(data: Partial<AddressValues>) {
  if (typeof window === "undefined") return;
  try {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null && v !== "") {
        clean[k] = v;
      }
    }
    if (Object.keys(clean).length > 0) {
      window.localStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(clean));
    }
  } catch {}
}

const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function AddressForm({ regions, emailOptional, defaults, busy, onSubmit }: {
  regions: RegionWithCities[]; emailOptional: boolean; defaults?: Partial<AddressValues>; busy: boolean; onSubmit: (v: AddressValues) => void;
}) {
  const schema = React.useMemo(() => z.object({
    firstName: z.string().trim().min(1, "نام را وارد کنید").max(60),
    lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید").max(60),
    mobilePhone: z.string().trim().transform((value) => toEn(value).replace(/[\s-]/g, "")).pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789)")),
    email: emailOptional ? z.string().trim().email("ایمیل معتبر نیست").optional().or(z.literal("")) : z.string().trim().email("ایمیل معتبر نیست"),
    regionId: z.coerce.number().int().positive("استان را انتخاب کنید"),
    cityId: z.coerce.number().int().positive("شهر را انتخاب کنید"),
    address: z.string().trim().min(5, "آدرس کامل را وارد کنید").max(500),
    postalCode: z.string().trim().transform(toEn).pipe(z.string().regex(/^\d{10}$/, "کد پستی ۱۰ رقمی الزامی است")),
    description: z.string().max(500).optional(),
  }), [emailOptional]);

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: defaults?.firstName ?? "", lastName: defaults?.lastName ?? "", mobilePhone: defaults?.mobilePhone ?? "", email: defaults?.email ?? "", address: defaults?.address ?? "", postalCode: defaults?.postalCode ?? "", description: defaults?.description ?? "", regionId: defaults?.regionId ?? 0, cityId: defaults?.cityId ?? 0 },
  });
  const regionId = Number(watch("regionId") || 0);
  const cities = regions.find((r) => r.id === regionId)?.cities ?? [];
  const { firstName: defaultFirstName, lastName: defaultLastName, mobilePhone: defaultMobile, email: defaultEmail } = defaults ?? {};

  // 1. Restore text fields from browser cache on mount
  React.useEffect(() => {
    const cached = loadAddressCache();
    if (!cached) return;

    const textKeys: Array<keyof CachedAddressData> = [
      "firstName",
      "lastName",
      "mobilePhone",
      "email",
      "postalCode",
      "address",
      "description",
    ];

    for (const key of textKeys) {
      const val = cached[key];
      if (typeof val === "string" && val.trim().length > 0) {
        setValue(key as any, val);
      }
    }
  }, [setValue]);

  // 2. Restore regionId and cityId once regions are loaded from Sazito
  React.useEffect(() => {
    if (!regions.length) return;
    const cached = loadAddressCache();
    if (!cached) return;

    const targetReg = Number(cached.regionId || 0);
    if (targetReg && regions.some((r) => r.id === targetReg)) {
      setValue("regionId", targetReg);

      const targetCity = Number(cached.cityId || 0);
      const reg = regions.find((r) => r.id === targetReg);
      if (targetCity && reg?.cities?.some((c) => c.id === targetCity)) {
        setValue("cityId", targetCity);
      }
    }
  }, [regions, setValue]);

  // 3. Fallback to user account profile defaults if field still empty
  React.useEffect(() => {
    const contactDefaults = { firstName: defaultFirstName, lastName: defaultLastName, mobilePhone: defaultMobile, email: defaultEmail };
    for (const key of ["firstName", "lastName", "mobilePhone", "email"] as const) {
      if (contactDefaults[key] && !getValues(key)) setValue(key, contactDefaults[key]);
    }
  }, [defaultFirstName, defaultLastName, defaultMobile, defaultEmail, getValues, setValue]);

  // 4. Auto-save all form changes to localStorage as the user types or selects
  React.useEffect(() => {
    const subscription = watch((value) => {
      saveAddressCache(value as Partial<AddressValues>);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const Err = ({ n }: { n: keyof AddressValues }) => (errors[n] ? <p id={`${n}-error`} className="shipping-field-error">{String(errors[n]?.message)}</p> : null);
  const accessibility = (name: keyof AddressValues) => ({ "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return (
    <form
      id="checkout-address-form"
      onSubmit={handleSubmit((v) => {
        saveAddressCache(v);
        onSubmit({ ...v, email: v.email || undefined, description: v.description || undefined } as AddressValues);
      })}
      className="shipping-address-form"
      noValidate
    >
      <fieldset disabled={busy} className="shipping-form-card">
        <section className="shipping-form-section" aria-labelledby="shipping-contact-title">
          <h3 id="shipping-contact-title">اطلاعات تماس</h3>
          <div className="shipping-form-grid">
            <div className="shipping-field"><Label htmlFor="firstName">نام *</Label><Input id="firstName" autoComplete="given-name" maxLength={60} required {...accessibility("firstName")} {...register("firstName")} /><Err n="firstName" /></div>
            <div className="shipping-field"><Label htmlFor="lastName">نام خانوادگی *</Label><Input id="lastName" autoComplete="family-name" maxLength={60} required {...accessibility("lastName")} {...register("lastName")} /><Err n="lastName" /></div>
            <div className="shipping-field"><Label htmlFor="mobilePhone">شماره موبایل *</Label><Input id="mobilePhone" inputMode="tel" dir="ltr" autoComplete="tel" required {...accessibility("mobilePhone")} {...register("mobilePhone")} /><Err n="mobilePhone" /></div>
            <div className="shipping-field"><Label htmlFor="email">ایمیل{emailOptional ? " (اختیاری)" : " *"}</Label><Input id="email" type="email" dir="ltr" autoComplete="email" required={!emailOptional} {...accessibility("email")} {...register("email")} /><Err n="email" /></div>
          </div>
        </section>
        <section className="shipping-form-section" aria-labelledby="shipping-address-title">
          <h3 id="shipping-address-title">آدرس ارسال</h3>
          <div className="shipping-form-grid shipping-location-grid">
            <Controller name="regionId" control={control} render={({ field }) => <AddressPicker id="regionId" label="استان" tehranFirst options={regions} value={Number(field.value) || 0} triggerRef={field.ref} disabled={!regions.length || busy} error={errors.regionId?.message} onChange={(id) => { field.onChange(id); setValue("cityId", "", { shouldValidate: !!errors.cityId }); }} />} />
            <Controller name="cityId" control={control} render={({ field }) => <AddressPicker id="cityId" label="شهر" options={cities} tehranFirst={regions.find((r) => r.id === regionId)?.name.trim() === "تهران"} value={Number(field.value) || 0} triggerRef={field.ref} disabled={!regionId || busy} error={errors.cityId?.message} onChange={field.onChange} />} />
            <div className="shipping-field"><Label htmlFor="postalCode">کد پستی *</Label><Input id="postalCode" inputMode="numeric" dir="ltr" autoComplete="postal-code" required maxLength={10} {...accessibility("postalCode")} {...register("postalCode")} /><Err n="postalCode" /></div>
          </div>
          {!regions.length && (
            <p role="status" className="text-xs text-muted-foreground flex items-center gap-1.5 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>در حال دریافت فهرست استان‌ها…</span>
            </p>
          )}
          <div className="shipping-field"><Label htmlFor="address">نشانی کامل *</Label><Textarea id="address" autoComplete="street-address" maxLength={500} required {...accessibility("address")} {...register("address")} /><Err n="address" /></div>
          <div className="shipping-field"><Label htmlFor="description">توضیحات (اختیاری)</Label><Input id="description" maxLength={500} {...accessibility("description")} {...register("description")} /><Err n="description" /></div>
        </section>
      </fieldset>
    </form>
  );
}
