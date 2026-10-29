"use client";

import { Download, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsletterSubscriber } from "@/lib/content-types";

export function AdminNewsletterManager({ initialSubscribers }: { initialSubscribers: NewsletterSubscriber[] }) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove(id: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove this subscriber.");
      setSubscribers((current) => current.filter((item) => item.id !== id));
      setConfirm(null); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  const visible = subscribers.filter((item) => item.email.includes(query.trim().toLowerCase()));
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Stay connected</p><h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Newsletter</h1><p className="mt-4 text-sm leading-7 text-stone-600">People who have asked to receive De Jadon Group news and updates. Export the list for your email campaign service.</p></div><a href="/api/admin/newsletter?format=csv" download className="inline-flex min-h-11 items-center gap-2 rounded-card border border-ink/20 bg-white px-4 text-sm font-semibold hover:bg-stone-50"><Download aria-hidden="true" className="h-4 w-4" />Export subscribers</a></div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-ink/10 bg-white p-5"><p className="text-sm"><strong className="text-2xl font-normal">{subscribers.length}</strong> {subscribers.length === 1 ? "subscriber" : "subscribers"}</p><div className="w-full sm:w-72"><label htmlFor="subscriber-search" className="sr-only">Search subscribers</label><input id="subscriber-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email addresses" className="min-h-11 w-full rounded-card border border-ink/20 px-3 text-base sm:text-sm" /></div></div>
    {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
    {visible.length ? <ul className="mt-6 divide-y divide-ink/10 rounded-card border border-ink/10 bg-white">{visible.map((subscriber) => <li key={subscriber.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0"><p className="break-all text-sm font-semibold">{subscriber.email}</p><p className="mt-1 text-xs text-stone-500">Joined {new Date(subscriber.subscribedAt).toLocaleDateString("en-GB", { timeZone: "Africa/Casablanca", year: "numeric", month: "short", day: "numeric" })}</p></div>{confirm === subscriber.id ? <div className="flex flex-wrap items-center gap-3 text-xs"><span>Remove from this list?</span><button type="button" disabled={busy} onClick={() => void remove(subscriber.id)} className="min-h-11 font-semibold text-red-700">Remove subscriber</button><button type="button" onClick={() => setConfirm(null)} className="min-h-11 font-semibold">Cancel</button></div> : <button type="button" aria-label={`Remove ${subscriber.email}`} onClick={() => setConfirm(subscriber.id)} className="flex h-11 w-11 items-center justify-center rounded-card text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>}</li>)}</ul> : <div className="mt-6 rounded-card border border-dashed border-ink/20 p-8 text-center"><Mail aria-hidden="true" className="mx-auto h-8 w-8 text-agriculture" /><h2 className="mt-4 text-2xl">{query ? "No matching subscribers" : "Your updates list starts here."}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{query ? "Try another email address." : "Signups from the homepage newsletter form will appear here."}</p></div>}
  </div>;
}
