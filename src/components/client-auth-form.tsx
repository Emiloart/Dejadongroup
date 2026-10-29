"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const inputClass = "mt-2 min-h-12 w-full rounded-card border border-ink/20 bg-white px-3 py-3 text-base text-ink focus-visible:outline-orange-700 sm:text-sm";

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
  if (existing && !another) return <div className="mt-7 border-y border-ink/10 py-6"><p className="text-sm leading-7 text-stone-600">Signed in as <strong className="text-ink">{existing}</strong>.</p><button type="button" onClick={continueToDashboard} className="mt-4 min-h-11 rounded-card bg-orangeAction px-5 text-sm font-semibold text-ink hover:brightness-95">Continue to client dashboard</button><button type="button" onClick={() => setAnother(true)} className="mt-3 block min-h-11 text-sm font-semibold text-stone-600 hover:text-orange-700">Use another client account</button></div>;
  return <div className="mt-7">
    <div className="flex gap-6 border-b border-ink/10">{(["signin", "activate"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setError(""); setPassword(""); setConfirm(""); }} className={`min-h-11 border-b-2 text-sm font-semibold ${mode === value ? "border-orangeAction text-ink" : "border-transparent text-stone-600"}`}>{value === "signin" ? "Sign in" : "Activate account"}</button>)}</div>
    <form onSubmit={submit} className="mt-6 space-y-5">
      <div><h2 className="text-2xl">{mode === "activate" ? "Activate your client account" : "Sign in to your client account"}</h2><p className="mt-2 text-sm leading-7 text-stone-600">{mode === "activate" ? "Enter the token supplied by De Jadon Group after your information has been verified and uploaded, then choose your email and password." : "Use the email and password you set when activating your account."}</p></div>
      {mode === "activate" ? <label className="block text-sm font-semibold">De Jadon Group token<input name="token" required maxLength={100} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Paste the token given to you" className={`${inputClass} font-mono`} /></label> : null}
      <label className="block text-sm font-semibold">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@gmail.com" className={inputClass} /></label>
      {mode === "activate" ? <p className="!mt-2 text-xs leading-6 text-stone-600">If De Jadon Group has already recorded your email, use that same address.</p> : null}
      <label className="block text-sm font-semibold">Password<input type="password" required minLength={mode === "activate" ? 10 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "activate" ? "new-password" : "current-password"} placeholder={mode === "activate" ? "At least 10 characters" : "Your password"} className={inputClass} /></label>
      {mode === "activate" ? <label className="block text-sm font-semibold">Confirm password<input type="password" required minLength={10} maxLength={128} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" className={inputClass} /></label> : null}
      {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}
      <button type="submit" disabled={busy} className="min-h-12 rounded-card bg-orangeAction px-6 text-sm font-semibold text-ink hover:brightness-95 disabled:opacity-60">{busy ? "Please wait…" : mode === "activate" ? "Activate account" : "Sign in"}</button>
      <p className="text-xs leading-6 text-stone-600">Need a token or help accessing your account? <a href="/contact" className="font-semibold text-orange-700 hover:underline">Contact De Jadon Group.</a></p>
    </form>
  </div>;
}
