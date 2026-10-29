import type { ReactNode } from "react";

export const partnerInputClass = "mt-2 min-h-12 w-full rounded-card border border-ink/20 bg-white px-3 py-3 text-base font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-orange-700 disabled:bg-stone-100 sm:text-sm";
export const partnerButtonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-ink px-5 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:opacity-50";
export function PartnerField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}{hint ? <span className="mt-2 block text-xs font-normal leading-6 text-stone-600">{hint}</span> : null}</label>;
}
export async function partnerRequest<T>(action: string, body: unknown, method = "POST"): Promise<T> {
  const response = await fetch(`/api/partner/${action}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "We could not complete this request. Please try again.");
  return result as T;
}
