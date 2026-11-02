"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { authButtonClass, authInputClass, AuthPasswordField } from "@/components/auth-form-ui";

export function AdminSignIn({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in failed. Please try again.");
      window.location.reload();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm px-5 py-12 sm:py-16">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_48px_-28px_rgba(36,31,25,0.3)]">
        <div className="flex items-center justify-between gap-5 border-b border-ink/10 bg-stone-50 px-6 py-5 sm:px-9"><Link href="/" aria-label="De Jadon Group, home"><BrandLogo className="h-10 w-auto" /></Link><ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-agriculture" /></div>
        <div className="p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Admin workspace</p>
        <h1 className="mt-3 text-3xl">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Sign in to your assigned department workspace with your staff account.</p>
        {configured ? <form onSubmit={signIn} className="mt-7 space-y-5">
          <div><label htmlFor="admin-email" className="block text-sm font-semibold">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} placeholder="Your staff email" className={authInputClass} /></div>
          <AuthPasswordField id="admin-password" label="Password" name="password" autoComplete="current-password" required maxLength={1024} placeholder="Your password" />
          {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p> : null}
          <button type="submit" disabled={busy} className={authButtonClass}>{busy ? "Signing in…" : "Sign in"}{!busy ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}</button>
        </form> : <p role="status" className="mt-7 rounded-card bg-warm p-4 text-sm leading-6 text-stone-700">Administrator access has not been set up yet. Ask the site owner to finish setting up access.</p>}
        <Link href="/admin-activate" className="mt-5 flex min-h-11 items-center justify-center text-sm font-semibold text-orange-700 hover:underline">Activate a staff invitation</Link>
        <div className="mt-5 border-t border-ink/10 pt-4"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orangeAction"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to website</Link></div>
        </div>
      </div>
    </main>
  );
}
