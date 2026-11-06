"use client";
import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/utils";

const normalize = (value: string) => value.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u200c\s]/g, "").toLowerCase();

export function AddressPicker({ id, label, options, value, onChange, error, disabled, tehranFirst, triggerRef }: {
  id: string; label: string; options: { id: number; name: string }[]; value: number;
  onChange: (id: number) => void; error?: string; disabled?: boolean; tehranFirst?: boolean; triggerRef?: React.Ref<HTMLButtonElement>;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listId = React.useId();
  const list = React.useRef<HTMLDivElement>(null);
  const filtered = options.filter((option) => normalize(option.name).includes(normalize(query)))
    .sort((a, b) => tehranFirst ? Number(normalize(b.name) === "تهران") - Number(normalize(a.name) === "تهران") : 0);
  const selected = options.find((option) => option.id === value);
  const pick = (id: number) => { onChange(id); setOpen(false); };
  React.useEffect(() => {
    if (open) list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  return <div className="shipping-field">
    <Label htmlFor={id}>{label} <span aria-hidden="true">*</span></Label>
    <button ref={triggerRef} id={id} type="button" role="combobox" aria-controls={listId} className="shipping-picker-trigger" disabled={disabled}
      aria-haspopup="dialog" aria-expanded={open} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
      onClick={() => { setQuery(""); setActive(0); setOpen(true); }}>
      <span>{selected?.name || `انتخاب ${label}`}</span><ChevronDown size={18} aria-hidden="true" />
    </button>
    {error && <p id={`${id}-error`} className="shipping-field-error">{error}</p>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title={`انتخاب ${label}`} className="shipping-picker-dialog" dir="rtl">
        <div className="shipping-picker-search"><Search size={19} aria-hidden="true" />
          <Input autoFocus role="combobox" aria-label={`جستجوی ${label}`} placeholder={`نام ${label} را بنویس…`}
            aria-autocomplete="list" aria-expanded="true" aria-controls={listId}
            aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
            value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setActive((i) => Math.max(0, Math.min(i + 1, filtered.length - 1))); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
              else if (event.key === "Enter") { event.preventDefault(); if (filtered[active]) pick(filtered[active].id); }
            }} />
        </div>
        <p className="shipping-picker-count" role="status">{formatNumber(filtered.length)} گزینه</p>
        <div ref={list} id={listId} role="listbox" aria-label={label} className="shipping-picker-list">
          {filtered.map((option, i) => <button type="button" role="option" tabIndex={-1} aria-selected={option.id === value}
            id={`${listId}-${option.id}`} key={option.id} data-active={active === i} onClick={() => pick(option.id)}>
            <span>{option.name}</span>{option.id === value && <Check size={18} aria-hidden="true" />}
          </button>)}
          {!filtered.length && <p>نتیجه‌ای پیدا نشد؛ نام دیگری جستجو کنید.</p>}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
