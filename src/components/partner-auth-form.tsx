"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PartnerDetailsForm } from "@/components/partner-details-form";
import { PartnerTierCheckout } from "@/components/partner-tier-checkout";
import { PartnerPaymentList } from "@/components/partner-payment-list";
import { partnerButtonClass, PartnerField, partnerInputClass, partnerRequest } from "@/components/partner-form-fields";
import type { PartnerView } from "@/lib/partner-types";

export function PartnerAuthForm({ initialMode = "signin", nextPath, referral, onSuccess }: { initialMode?: "signin" | "signup"; nextPath?: string; referral?: string; onSuccess?: () => void }) {
  const router = useRouter(); const [mode, setMode] = useState(initialMode); const [view, setView] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  async function load() {
    const response = await fetch("/api/partner/session", { cache: "no-store" });
    if (response.status === 401) { setView(null); return null; }
    const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not load your partner account.");
    setView(result); return result as PartnerView;
  }
  useEffect(() => {
    let active = true;
    fetch("/api/partner/session", { cache: "no-store" }).then(async (response) => {
      if (response.ok && active) { const result = await response.json(); if (active) setView(result); }
    }).catch(() => { if (active) setError("Your account could not be loaded. Refresh the page to try again."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function continueToDashboard() {
    const root = "/dashboard/partner";
    const destination = nextPath && (nextPath === root || nextPath.startsWith(`${root}/`) || nextPath.startsWith(`${root}?`) || nextPath.startsWith(`${root}#`)) ? nextPath : root;
    onSuccess?.(); router.push(destination); router.refresh();
  }
  async function refresh() { const next = await load(); if (next?.active) continueToDashboard(); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    if (mode === "signup" && form.get("password") !== form.get("confirmPassword")) { setError("Passwords do not match."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await partnerRequest<{ verificationSent?: boolean }>(mode === "signup" ? "register" : "session", { fullName: form.get("fullName"), email: form.get("email"), password: form.get("password"), ref: referral || "" });
      if (mode === "signup") setNotice(result.verificationSent ? "We sent a verification code to your email. Check your inbox and spam folder." : "Your account was created, but the verification email could not be sent. Please request another code below after 60 seconds.");
      await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const code = new FormData(event.currentTarget).get("code"); setBusy(true); setError(""); setNotice("");
    try { await partnerRequest("verify", { code }); setNotice("Email verified. Complete your personal details to continue."); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setError("");
    try { await partnerRequest("resend", {}); setNotice("A new code has been sent. It expires in 10 minutes and replaces the previous code."); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError("");
    try { await partnerRequest("session", {}, "DELETE"); setView(null); setNotice(""); setMode("signin"); router.refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  if (loading) return <p role="status" className="mt-7 text-sm text-stone-600">Loading your partner account…</p>;
  return <div className="mt-7">
    {view ? <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4"><p className="min-w-0 break-all text-xs text-stone-600">{view.partner.email}</p><button type="button" disabled={busy} onClick={signOut} className="min-h-11 text-xs font-semibold text-orange-700">Sign out</button></div> : <div className="flex gap-6 border-b border-ink/10">{(["signin", "signup"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setError(""); setNotice(""); }} className={`min-h-11 border-b-2 text-sm font-semibold ${mode === value ? "border-orangeAction text-ink" : "border-transparent text-stone-600"}`}>{value === "signin" ? "Sign in" : "Create account"}</button>)}</div>}
    {view && !view.active || !view && mode === "signup" ? <ol aria-label="Registration progress" className="mb-6 mt-5 grid grid-cols-2 gap-3 text-xs leading-6"><li className={view ? "text-agriculture" : "font-semibold"}>1. Account & verification</li><li className={view?.partner.emailVerifiedAt ? "font-semibold text-agriculture" : "text-stone-500"}>2. Details, tier & payment</li></ol> : null}
    {error ? <p role="alert" className="my-5 text-sm leading-7 text-red-700">{error}</p> : null}{notice ? <p role="status" className="my-5 rounded-card bg-green-50 p-4 text-sm leading-7 text-green-900">{notice}</p> : null}
    {!view ? <form onSubmit={submit} className="mt-6"><fieldset disabled={busy} className="min-w-0 space-y-5"><legend className="sr-only">Partner account registration</legend><div><h2 className="text-2xl">{mode === "signup" ? "Create your partner account" : "Sign in to your partner account"}</h2><p className="mt-2 text-sm leading-7 text-stone-600">{mode === "signup" ? "Create your account and verify your email before adding personal details, choosing a tier and completing payment." : "Use your registered email and password. Incomplete registrations continue where you left off."}</p></div>{mode === "signup" ? <PartnerField label="Full name"><input name="fullName" required minLength={2} maxLength={120} autoComplete="name" className={partnerInputClass} /></PartnerField> : null}<PartnerField label="Email address"><input name="email" type="email" required maxLength={254} autoComplete="email" className={partnerInputClass} /></PartnerField><PartnerField label="Password"><input name="password" type="password" required minLength={mode === "signup" ? 10 : undefined} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} className={partnerInputClass} /></PartnerField>{mode === "signup" ? <PartnerField label="Confirm password"><input name="confirmPassword" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={partnerInputClass} /></PartnerField> : null}<button type="submit" className={partnerButtonClass}>{busy ? "Please wait…" : mode === "signup" ? "Create account & verify email" : "Sign in"}</button></fieldset></form> : view.active ? <div><h2 className="text-2xl">Welcome back, {view.partner.fullName}</h2><p className="mt-3 text-sm leading-7 text-stone-600">Your {view.currentTier?.name} membership is active.</p><button type="button" onClick={continueToDashboard} className={`${partnerButtonClass} mt-5`}>Continue to partner dashboard</button></div> : !view.partner.emailVerifiedAt ? <div><h2 className="text-2xl">Verify your email</h2><p className="mt-3 text-sm leading-7 text-stone-600">Enter the six-digit code sent to {view.partner.email}. It expires in 10 minutes. Email verification is required before personal details or payment.</p><form onSubmit={verify} className="mt-5 space-y-5"><PartnerField label="Verification code"><input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} className={`${partnerInputClass} font-mono tracking-[0.3em]`} /></PartnerField><div className="flex flex-wrap items-center gap-5"><button type="submit" disabled={busy} className={partnerButtonClass}>{busy ? "Checking…" : "Verify email"}</button><button type="button" disabled={busy} onClick={resend} className="min-h-11 text-sm font-semibold text-orange-700">Resend code</button></div></form></div> : !view.partner.profileCompletedAt ? <div><h2 className="text-2xl">Your personal details</h2><p className="mt-3 text-sm leading-7 text-stone-600">Your email is verified. Add the details below before choosing your partner tier.</p><PartnerDetailsForm partner={view.partner} onSaved={refresh} /></div> : <div><h2 className="text-2xl">Choose your partner tier</h2><p className="mt-3 text-sm leading-7 text-stone-600">Review each tier’s fee and benefits, then apply a promo code if you have one.</p><PartnerTierCheckout view={view} onChanged={refresh} /><h3 className="mt-9 text-xl">Registration payments</h3><PartnerPaymentList payments={view.payments} onChanged={refresh} /></div>}
  </div>;
}
