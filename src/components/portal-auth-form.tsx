"use client";

import { useEffect, useState } from "react";
import { ClientAuthForm } from "@/components/client-auth-form";
import { PartnerAuthForm } from "@/components/partner-auth-form";
import type { DashboardRole } from "@/types/site";

export function PortalAuthForm({ initialRole, initialMode, referral, nextPath, hideRoleChooser = false, onSuccess }: { initialRole: DashboardRole; initialMode?: "signin" | "signup"; referral?: string; nextPath?: string; hideRoleChooser?: boolean; onSuccess?: () => void }) {
  const [role, setRole] = useState(initialRole);
  useEffect(() => setRole(initialRole), [initialRole]);
  return <div>
    {!hideRoleChooser ? <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Choose your portal</p><div className="mt-3 flex gap-6 border-b border-ink/10">{(["partner", "client"] as const).map((option) => <button key={option} type="button" aria-pressed={role === option} onClick={() => setRole(option)} className={`min-h-11 border-b-2 text-sm font-semibold capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${role === option ? "border-orangeAction text-ink" : "border-transparent text-stone-600 hover:text-orange-700"}`}>{option}</button>)}</div></div> : null}
    {role === "client" ? <ClientAuthForm nextPath={nextPath} onSuccess={onSuccess} /> : <PartnerAuthForm initialMode={initialMode} referral={referral} nextPath={nextPath} onSuccess={onSuccess} />}
  </div>;
}
