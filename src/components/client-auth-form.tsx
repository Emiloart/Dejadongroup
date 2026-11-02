"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, KeyRound } from "lucide-react";
import { authButtonClass, authInputClass as inputClass, AuthModeTabs, AuthPasswordField } from "@/components/auth-form-ui";

export function ClientAuthForm({ nextPath, onSuccess }: { nextPath?: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "activate">("signin");
  const [existing, setExisting] = useState<string | null>(null);
  const [another, setAnother] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/client/session", { cache: "no-store" }).then(async (response) => {
      if (response.ok) { const result = await response.json(); if (active) setExisting(result.client.fullName); }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  function continueToDashboard() {
    const root = "/dashboard/client";
    const destination = nextPath && (nextPath === root || nextPath.startsWith(`${root}/`) || nextPath.startsWith(`${root}#`) || nextPath.startsWith(`${root}?`)) ? nextPath : root;
    onSuccess?.(); router.push(destination); router.refresh();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (mode === "activate" && password !== confirm) { setError("Passwords do not match."); return; }
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch(mode === "activate" ? "/api/client/register" : "/api/client/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password, ...(mode === "activate" ? { token: form.get("token") } : {}) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t open your account. Try again.");
      continueToDashboard();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  if (existing && !another) return <div className="mt-7 rounded-xl border border-agriculture/15 bg-agriculture/5 p-5"><CircleCheck aria-hidden="true" className="mb-4 h-7 w-7 text-agriculture" /><h2 className="text-2xl">Welcome back, {existing}</h2><p className="mt-3 text-sm leading-7 text-stone-600">Your client account is signed in and ready.</p><button type="button" onClick={continueToDashboard} className={`${authButtonClass} mt-5`}>Continue to client dashboard<ArrowRight aria-hidden="true" className="h-4 w-4" /></button><button type="button" onClick={() => setAnother(true)} className="mx-auto mt-3 block min-h-11 text-sm font-semibold text-stone-600 hover:text-orange-700">Use another client account</button></div>;
  return <div className="mt-7">
    <AuthModeTabs value={mode} options={[{ value: "signin", label: "Sign in" }, { value: "activate", label: "Activate account" }]} onChange={(value) => { setMode(value as "signin" | "activate"); setError(""); setPassword(""); setConfirm(""); }} />
    <form onSubmit={submit} className="mt-6 space-y-5">
      <div><h2 className="text-2xl sm:text-3xl">{mode === "activate" ? "Activate your client account" : "Sign in to your client account"}</h2><p className="mt-2 text-sm leading-7 text-stone-600">{mode === "activate" ? "Enter the token supplied by De Jadon Group after your information has been verified and uploaded, then choose your email and password." : "Welcome back. Use the email and password you set when activating your account."}</p></div>
      {mode === "activate" ? <p className="flex items-start gap-3 rounded-xl bg-warm px-4 py-3 text-xs leading-6 text-stone-600"><KeyRound aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-agriculture" />Your token connects you to the client record prepared by our team.</p> : null}
      {mode === "activate" ? <label className="block text-sm font-semibold">De Jadon Group token<input name="token" required maxLength={100} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Paste the token given to you" className={`${inputClass} font-mono`} /></label> : null}
      <label className="block text-sm font-semibold">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@gmail.com" className={inputClass} /></label>
      {mode === "activate" ? <p className="!mt-2 text-xs leading-6 text-stone-600">If De Jadon Group has already recorded your email, use that same address.</p> : null}
      <AuthPasswordField label="Password" required minLength={mode === "activate" ? 10 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "activate" ? "new-password" : "current-password"} placeholder={mode === "activate" ? "At least 10 characters" : "Your password"} />
      {mode === "activate" ? <AuthPasswordField label="Confirm password" required minLength={10} maxLength={128} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" /> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p> : null}
      <button type="submit" disabled={busy} className={authButtonClass}>{busy ? "Please wait…" : mode === "activate" ? "Activate account" : "Sign in"}{!busy ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}</button>
      <p className="border-t border-ink/10 pt-5 text-center text-xs leading-6 text-stone-600">Need a token or help accessing your account? <a href="/contact" className="font-semibold text-orange-700 hover:underline">Contact De Jadon Group.</a></p>
    </form>
  </div>;
}
