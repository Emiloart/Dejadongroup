"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ClientDetails } from "@/lib/client-types";

const inputClass = "mt-2 min-h-12 w-full rounded-card border border-ink/20 bg-white px-3 py-3 text-base sm:text-sm";

export function ClientProfileEditor({ client }: { client: ClientDetails }) {
  const router = useRouter();
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const password = String(form.get("newPassword") || "");
    if (password !== form.get("confirmPassword")) { setError("New passwords do not match."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/client/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, phone, currentPassword: form.get("currentPassword"), newPassword: password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update your profile.");
      element.reset(); setEmail(result.client.email); setPhone(result.client.phone); setNotice("Your profile has been saved."); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Your account</p><h1 className="mt-3 text-4xl tracking-tight">Profile</h1><p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">Manage your contact details and password. Your verified name is maintained by De Jadon Group.</p><div className="mt-8 rounded-card border border-ink/10 bg-white p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Verified client</p><h2 className="mt-3 break-words text-2xl">{client.fullName}</h2><p className="mt-2 break-all text-xs text-stone-500">Client ID: {client.id}</p></div><form onSubmit={save} className="mt-6 max-w-3xl rounded-card border border-ink/10 bg-white p-5 sm:p-7"><fieldset disabled={busy} className="min-w-0 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label><label className="block text-sm font-semibold">Phone number<input type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} /></label></div><div className="border-t border-ink/10 pt-5"><h2 className="text-xl">Account security</h2><p className="mt-2 text-xs leading-6 text-stone-500">Enter your current password when changing your email or password. Leave the new password blank to keep it.</p><label className="mt-4 block text-sm font-semibold">Current password<input name="currentPassword" type="password" maxLength={128} autoComplete="current-password" className={inputClass} /></label><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">New password<input name="newPassword" type="password" minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></label><label className="block text-sm font-semibold">Confirm new password<input name="confirmPassword" type="password" minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></label></div></div>{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}{notice ? <p role="status" className="text-sm text-green-800">{notice}</p> : null}<button type="submit" className="min-h-12 rounded-card bg-ink px-5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50">{busy ? "Saving…" : "Save profile"}</button></fieldset></form><a href="/contact" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-orange-700">Contact our team to update verified identity details ↗</a></div>;
}
