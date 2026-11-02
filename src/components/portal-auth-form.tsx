"use client";

import { useEffect, useState } from "react";
import { Check, Handshake, Sprout } from "lucide-react";
import { ClientAuthForm } from "@/components/client-auth-form";
import { PartnerAuthForm } from "@/components/partner-auth-form";
import type { DashboardRole } from "@/types/site";

export function PortalAuthForm({ initialRole, initialMode, referral, nextPath, hideRoleChooser = false, onSuccess }: { initialRole: DashboardRole; initialMode?: "signin" | "signup"; referral?: string; nextPath?: string; hideRoleChooser?: boolean; onSuccess?: () => void }) {
  const [role, setRole] = useState(initialRole);
  useEffect(() => setRole(initialRole), [initialRole]);
  return <div>
    {!hideRoleChooser ? <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Choose your portal</p><div className="mt-3 grid grid-cols-2 gap-3">{(["partner", "client"] as const).map((option) => {
      const selected = role === option;
      const Icon = option === "partner" ? Handshake : Sprout;
      return <button key={option} type="button" aria-label={option === "partner" ? "Partner" : "Client"} aria-pressed={selected} onClick={() => setRole(option)} className={`relative min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 sm:p-4 ${selected ? "border-agriculture bg-agriculture/5 ring-1 ring-agriculture/10" : "border-stone-200 hover:border-stone-400"}`}>
        <Icon aria-hidden="true" className={`mb-2 h-5 w-5 ${selected ? "text-agriculture" : "text-stone-500"}`} />
        {selected ? <Check aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 text-agriculture" /> : null}
        <span className="block text-sm font-semibold capitalize text-ink">{option}</span><span className="mt-1 block text-xs leading-5 text-stone-600">{option === "partner" ? "Membership & referrals" : "Your assigned services"}</span>
      </button>;
    })}</div></div> : null}
    {role === "client" ? <ClientAuthForm nextPath={nextPath} onSuccess={onSuccess} /> : <PartnerAuthForm initialMode={initialMode} referral={referral} nextPath={nextPath} onSuccess={onSuccess} />}
  </div>;
}
