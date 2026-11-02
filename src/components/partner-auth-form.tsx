"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, CircleCheck, LoaderCircle, MailCheck } from "lucide-react";
import { authButtonClass, authInputClass, AuthModeTabs, AuthPasswordField } from "@/components/auth-form-ui";
import { PartnerDetailsForm } from "@/components/partner-details-form";
import { PartnerTierCheckout } from "@/components/partner-tier-checkout";
import { PartnerPaymentList } from "@/components/partner-payment-list";
import { PartnerField, partnerRequest } from "@/components/partner-form-fields";
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
  if (loading) return <p role="status" className="mt-7 flex min-h-36 items-center justify-center gap-3 rounded-xl bg-stone-50 text-sm text-stone-600"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-agriculture" />Loading your partner account…</p>;
  return <div className="mt-7">
    {view ? <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3"><div className="min-w-0"><p className="break-all text-xs font-semibold text-ink">{view.partner.email}</p><p className="mt-1 text-xs text-stone-500">{view.partner.emailVerifiedAt ? "Email verified" : "Email verification pending"}</p></div><button type="button" disabled={busy} onClick={signOut} className="min-h-11 text-xs font-semibold text-orange-700 hover:underline">Sign out</button></div> : <AuthModeTabs value={mode} options={[{ value: "signin", label: "Sign in" }, { value: "signup", label: "Create account" }]} onChange={(value) => { setMode(value as "signin" | "signup"); setError(""); setNotice(""); }} />}
    {view && !view.active || !view && mode === "signup" ? <ol aria-label="Registration progress" className="mb-6 mt-5 grid grid-cols-2 gap-3">{["Account & verification", "Details, tier & payment"].map((label, index) => {
      const completed = index === 0 && !!view?.partner.emailVerifiedAt;
      const current = index === (view?.partner.emailVerifiedAt ? 1 : 0);
      return <li key={label} aria-current={current ? "step" : undefined} className={`flex items-start gap-2 border-t-2 pt-3 ${completed || current ? "border-agriculture" : "border-stone-200"}`}><span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${completed || current ? "bg-agriculture text-white" : "bg-stone-100 text-stone-500"}`}>{completed ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : index + 1}</span><span className={`text-xs leading-6 ${current ? "font-semibold text-ink" : completed ? "text-agriculture" : "text-stone-500"}`}>{label}</span></li>;
    })}</ol> : null}
    {error ? <p role="alert" className="my-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">{error}</p> : null}{notice ? <p role="status" className="my-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-7 text-green-900">{notice}</p> : null}
    {!view ? <form onSubmit={submit} className="mt-6"><fieldset disabled={busy} className="min-w-0 space-y-5"><legend className="sr-only">Partner account registration</legend>
      <div><h2 className="text-2xl sm:text-3xl">{mode === "signup" ? "Create your partner account" : "Sign in to your partner account"}</h2><p className="mt-2 text-sm leading-7 text-stone-600">{mode === "signup" ? "Create your account and verify your email before adding personal details, choosing a tier and completing payment." : "Welcome back. Use your registered email and password. Incomplete registrations continue where you left off."}</p></div>
      {mode === "signup" ? <PartnerField label="Full name"><input name="fullName" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your full name" className={authInputClass} /></PartnerField> : null}
      <PartnerField label="Email address"><input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className={authInputClass} /></PartnerField>
      <AuthPasswordField label="Password" name="password" required minLength={mode === "signup" ? 10 : undefined} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "At least 10 characters" : "Your password"} />
      {mode === "signup" ? <AuthPasswordField label="Confirm password" name="confirmPassword" required minLength={10} maxLength={128} autoComplete="new-password" placeholder="Enter your password again" /> : null}
      <button type="submit" className={authButtonClass}>{busy ? "Please wait…" : mode === "signup" ? "Create account & verify email" : "Sign in"}{!busy ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}</button>
    </fieldset></form> : view.active ? <div className="rounded-xl border border-agriculture/15 bg-agriculture/5 p-5"><CircleCheck aria-hidden="true" className="mb-4 h-7 w-7 text-agriculture" /><h2 className="text-2xl">Welcome back, {view.partner.fullName}</h2><p className="mt-3 text-sm leading-7 text-stone-600">Your {view.currentTier?.name} membership is active.</p><button type="button" onClick={continueToDashboard} className={`${authButtonClass} mt-5`}>Continue to partner dashboard<ArrowRight aria-hidden="true" className="h-4 w-4" /></button></div> : !view.partner.emailVerifiedAt ? <div><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-agriculture/10"><MailCheck aria-hidden="true" className="h-6 w-6 text-agriculture" /></div><h2 className="text-2xl sm:text-3xl">Verify your email</h2><p className="mt-3 break-words text-sm leading-7 text-stone-600">Enter the six-digit code sent to {view.partner.email}. It expires in 10 minutes. Email verification is required before personal details or payment.</p><form onSubmit={verify} className="mt-5 space-y-5"><PartnerField label="Verification code"><input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} placeholder="000000" className={`${authInputClass} text-center font-mono text-xl tracking-[0.4em] sm:text-xl`} /></PartnerField><button type="submit" disabled={busy} className={authButtonClass}>{busy ? "Checking…" : "Verify email"}</button><p className="text-center text-xs text-stone-500">Didn’t receive your email? <button type="button" disabled={busy} onClick={resend} className="min-h-11 font-semibold text-orange-700 hover:underline">Resend code</button></p></form></div> : !view.partner.profileCompletedAt ? <div><h2 className="text-2xl sm:text-3xl">Your personal details</h2><p className="mt-3 text-sm leading-7 text-stone-600">Your email is verified. Add the details below before choosing your partner tier.</p><PartnerDetailsForm partner={view.partner} onSaved={refresh} /></div> : <div><h2 className="text-2xl sm:text-3xl">Choose your partner tier</h2><p className="mt-3 text-sm leading-7 text-stone-600">Review each tier’s fee and benefits, then apply a promo code if you have one.</p><PartnerTierCheckout view={view} onChanged={refresh} /><h3 className="mt-9 text-xl">Registration payments</h3><PartnerPaymentList payments={view.payments} onChanged={refresh} /></div>}
    {!view ? <p className="mt-6 border-t border-ink/10 pt-5 text-center text-xs leading-6 text-stone-600">Questions about joining? <a href="/partner-program#faqs" className="font-semibold text-orange-700 hover:underline">Explore the Partner Programme.</a></p> : null}
  </div>;
}
