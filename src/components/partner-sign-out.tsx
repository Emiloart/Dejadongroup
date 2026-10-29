"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { partnerRequest } from "@/components/partner-form-fields";
export function PartnerSignOut() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function signOut() {
    setBusy(true); setError("");
    try { await partnerRequest("session", {}, "DELETE"); router.replace("/login?role=partner"); router.refresh(); }
    catch { setBusy(false); setError("Could not sign out. Please try again."); }
  }
  return <div><button type="button" onClick={signOut} disabled={busy} className="min-h-11 text-sm font-semibold text-orangeAction hover:underline disabled:opacity-50">{busy ? "Signing out…" : "Sign out"}</button>{error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}</div>;
}
