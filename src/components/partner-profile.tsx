"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PartnerDetailsForm } from "@/components/partner-details-form";
import { DashboardReferralTools } from "@/components/dashboard-referral-tools";
import type { PartnerAccount } from "@/lib/partner-types";

export function PartnerProfile({ initialPartner }: { initialPartner: PartnerAccount }) {
  const [partner, setPartner] = useState(initialPartner); const router = useRouter();
  async function refresh() {
    const response = await fetch("/api/partner/session", { cache: "no-store" });
    const result = await response.json(); if (!response.ok || !result.active) { router.replace("/login?role=partner"); router.refresh(); return; }
    setPartner(result.partner); router.refresh();
  }
  return <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Account details</p><h1 className="mt-3 text-4xl">Your profile</h1><p className="mt-4 text-sm leading-7 text-stone-600">Manage your personal details, profile photo, password and referral username.</p><p className="mt-3 break-all text-xs text-stone-500">Partner ID: {partner.id}</p><div className="mt-7 rounded-card border border-ink/10 bg-white p-5 sm:p-7"><PartnerDetailsForm partner={partner} profile onSaved={refresh} /></div><DashboardReferralTools username={partner.username} /></div>;
}
