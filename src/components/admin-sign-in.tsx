"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";

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
    <main className="flex min-h-screen items-center justify-center bg-warm px-5 py-12">
      <div className="w-full max-w-md rounded-card border border-ink/10 bg-white p-6 sm:p-9">
        <Link href="/" aria-label="De Jadon Group, home"><BrandLogo className="h-12 w-auto" /></Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Admin workspace</p>
        <h1 className="mt-3 text-3xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Sign in to manage marketplace products and website content.</p>
        {configured ? <form onSubmit={signIn} className="mt-7 space-y-5">
          <div><label htmlFor="admin-email" className="mb-2 block text-sm font-semibold">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} className="min-h-12 w-full rounded-card border border-ink/20 bg-white px-3" /></div>
          <div><label htmlFor="admin-password" className="mb-2 block text-sm font-semibold">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} className="min-h-12 w-full rounded-card border border-ink/20 bg-white px-3" /></div>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-card bg-orangeAction px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        </form> : <p role="status" className="mt-7 rounded-card bg-warm p-4 text-sm leading-6 text-stone-700">Administrator access has not been set up yet. Ask the site owner to finish setting up access.</p>}
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-stone-600 hover:text-orangeAction">Back to website</Link>
      </div>
    </main>
  );
}
