"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

export const authInputClass = "mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-normal text-ink outline-none transition focus-visible:border-orange-700 focus-visible:ring-2 focus-visible:ring-orange-700/15 disabled:bg-stone-100 sm:text-sm";
export const authButtonClass = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:opacity-50";

export function AuthPasswordField({ label, hint, className, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  return <div>
    <label htmlFor={inputId} className="block text-sm font-semibold">{label}</label>
    <div className="relative mt-2">
      <input {...props} id={inputId} type={visible ? "text" : "password"} aria-describedby={hint ? `${inputId}-hint` : undefined} className={`${className || authInputClass} !mt-0 pr-14`} />
      <button type="button" disabled={props.disabled} onClick={() => setVisible(!visible)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute right-1 top-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700">
        {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
      </button>
    </div>
    {hint ? <p id={`${inputId}-hint`} className="mt-2 text-xs font-normal leading-6 text-stone-500">{hint}</p> : null}
  </div>;
}

export function AuthModeTabs({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <div className="flex gap-1 rounded-xl bg-stone-100 p-1">{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-11 min-w-0 flex-1 rounded-lg px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700 ${value === option.value ? "bg-white text-ink shadow-sm" : "text-stone-600 hover:text-ink"}`}>{option.label}</button>)}</div>;
}
