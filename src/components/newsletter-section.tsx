"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";

export function NewsletterSection() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), consent: form.get("consent") === "on", website: form.get("website") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t save your subscription. Please try again.");
      setDone(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section id="newsletter" aria-labelledby="newsletter-heading" className="bg-agriculture text-white">
    <div className="mx-auto grid max-w-7xl items-center gap-5 px-5 py-7 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:px-8 lg:py-8">
      <div className="max-w-md"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-green-100">The De Jadon newsletter</p><h2 id="newsletter-heading" className="mt-1.5 text-2xl tracking-tight sm:text-3xl">Stay in the loop.</h2><p className="mt-2 text-sm leading-6 text-white/85">News and updates from De Jadon Group, straight to your inbox.</p></div>
      {done ? <p role="status" className="flex items-start gap-3 rounded-card border border-white/25 bg-white/10 p-4 text-sm leading-6"><Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />Thanks for subscribing. You’re on our updates list.</p> : <form onSubmit={subscribe} className="min-w-0">
        <label htmlFor="newsletter-email" className="text-sm font-semibold">Your email address</label>
        <div className="mt-2 flex flex-col gap-2 min-[380px]:flex-row"><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required disabled={busy} className="min-h-11 min-w-0 flex-1 rounded-card border border-white/30 bg-white px-3 text-base text-ink placeholder:text-stone-400 focus-visible:outline-white" /><button type="submit" disabled={busy} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-card bg-orangeAction px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">{busy ? "Subscribing…" : "Subscribe"}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button></div>
        <label className="mt-2.5 flex items-start gap-2 text-xs leading-5 text-white/90"><input name="consent" type="checkbox" required disabled={busy} className="mt-0.5 h-4 w-4 shrink-0 accent-orangeAction" /><span>I agree to receive email updates from De Jadon Group.</span></label>
        <div aria-hidden="true" className="hidden"><label htmlFor="newsletter-website">Website</label><input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
        {error ? <p role="alert" className="mt-3 rounded-card bg-white px-3 py-2 text-sm text-red-800">{error}</p> : null}
      </form>}
    </div>
  </section>;
}
