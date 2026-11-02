"use client";

import { LifeBuoy, MessageCircle, Plus, RotateCw, Send } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { CustomerTicketDetail, CustomerTicketSummary, SupportCategory, SupportRole } from "@/lib/support-store";

const categories: { value: SupportCategory; label: string }[] = [
  { value: "account", label: "Account access" },
  { value: "investment", label: "Investment or property" },
  { value: "savings", label: "Flexisave or savings" },
  { value: "partner_programme", label: "Partner Programme" },
  { value: "payment", label: "Payment" },
  { value: "technical", label: "Website or dashboard" },
  { value: "other", label: "Something else" }
];
const inputClass = "mt-2 min-h-12 w-full rounded-card border border-ink/15 bg-white px-3 py-3 text-base sm:text-sm";
const statusLabels: Record<CustomerTicketSummary["status"], string> = { open: "Awaiting our team", in_progress: "In progress", awaiting_customer: "Awaiting your reply", resolved: "Resolved" };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Casablanca", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusClass(status: CustomerTicketSummary["status"]) {
  if (status === "resolved") return "bg-green-50 text-green-800";
  if (status === "awaiting_customer") return "bg-amber-50 text-amber-900";
  return "bg-orange-50 text-orange-900";
}

export function CustomerSupportWorkspace({ role }: { role: SupportRole }) {
  const base = `/api/support/${role}`;
  const [tickets, setTickets] = useState<CustomerTicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<CustomerTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [compose, setCompose] = useState(false);
  const [category, setCategory] = useState<SupportCategory>(role === "partner" ? "partner_programme" : "account");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchTickets = useCallback(async () => {
    const response = await fetch(base, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load your support requests.");
    return result.tickets as CustomerTicketSummary[];
  }, [base]);

  const fetchTicket = useCallback(async (id: string) => {
    const response = await fetch(`${base}/${encodeURIComponent(id)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load this conversation.");
    return result.ticket as CustomerTicketDetail;
  }, [base]);

  const refresh = useCallback(async (preferredId: string) => {
    setError("");
    try {
      const rows = await fetchTickets();
      setTickets(rows);
      const target = rows.some((ticket) => ticket.id === preferredId) ? preferredId : rows[0]?.id || "";
      setSelectedId(target);
      setDetail(target ? await fetchTicket(target) : null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load support.");
    } finally { setLoading(false); }
  }, [fetchTicket, fetchTickets]);

  useEffect(() => { void refresh(""); }, [refresh]);

  async function selectTicket(id: string) {
    setSelectedId(id); setError(""); setNotice(""); setBusy(true);
    try { setDetail(await fetchTicket(id)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not load this conversation."); }
    finally { setBusy(false); }
  }

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, subject, message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your request.");
      setCompose(false); setSubject(""); setMessage(""); setNotice("Your request has been sent to De Jadon Support.");
      setDetail(result.ticket as CustomerTicketDetail); setSelectedId(result.ticket.id);
      setTickets(await fetchTickets());
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not send your request."); }
    finally { setBusy(false); }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!detail) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${base}/${encodeURIComponent(detail.id)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reply", message: reply }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your reply.");
      setReply(""); setDetail(result.ticket as CustomerTicketDetail); setTickets(await fetchTickets());
      setNotice(detail.status === "resolved" ? "Your reply reopened this request." : "Your reply has been sent.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not send your reply."); }
    finally { setBusy(false); }
  }

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">De Jadon Group</p><h1 className="mt-3 text-4xl tracking-tight">Support</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Send a private request to our team and follow replies here in your dashboard.</p></div>
      <div className="flex gap-2">
      <button type="button" onClick={() => void refresh(selectedId)} className="inline-flex min-h-11 items-center gap-2 rounded-card border border-ink/15 bg-white px-4 text-sm font-semibold hover:bg-warm" disabled={busy}><RotateCw size={16} aria-hidden="true" />Refresh</button>
        <button type="button" onClick={() => { setCompose((value) => !value); setError(""); }} className="inline-flex min-h-11 items-center gap-2 rounded-card bg-ink px-4 text-sm font-semibold text-white hover:bg-stone-700"><Plus size={17} aria-hidden="true" />New request</button>
      </div>
    </div>

    <div aria-live="polite" className="mt-5">{error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}{notice ? <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{notice}</p> : null}</div>

    {compose ? <form onSubmit={createRequest} className="mt-6 rounded-card border border-ink/10 bg-white p-5 sm:p-7">
      <div className="flex items-start gap-3"><LifeBuoy className="mt-1 shrink-0 text-agriculture" size={22} aria-hidden="true" /><div><h2 className="text-2xl">How can we help?</h2><p className="mt-2 text-sm leading-6 text-stone-600">Your request is linked to your signed-in {role} account.</p></div></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold">Topic<select required className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as SupportCategory)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="block text-sm font-semibold">Subject<input required maxLength={120} className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A short summary" /></label>
      </div>
      <label className="mt-5 block text-sm font-semibold">Message<textarea required minLength={1} maxLength={4000} rows={5} className={`${inputClass} resize-y`} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe what you need help with." /><span className="mt-1 block text-xs font-normal text-stone-500">Do not include passwords, PINs, one-time codes, or full bank details.</span></label>
      <div className="mt-5 flex flex-wrap gap-3"><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-card bg-ink px-5 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} aria-hidden="true" />{busy ? "Sending…" : "Send request"}</button><button type="button" onClick={() => setCompose(false)} className="min-h-11 rounded-card px-4 text-sm font-semibold text-stone-700 hover:bg-warm">Cancel</button></div>
    </form> : null}

    <div className="mt-7 grid min-w-0 gap-5 xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.6fr)]">
      <section aria-labelledby="my-requests-heading" className="min-w-0 rounded-card border border-ink/10 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><h2 id="my-requests-heading" className="text-xl">Your requests</h2><span className="text-xs text-stone-500">{tickets.length}</span></div>
        {loading ? <p role="status" className="py-8 text-sm text-stone-500">Loading your requests…</p> : tickets.length ? <div className="mt-4 space-y-2">{tickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => void selectTicket(ticket.id)} className={`block w-full rounded-lg border p-4 text-left transition ${selectedId === ticket.id ? "border-agriculture bg-green-50/60" : "border-ink/10 hover:border-ink/25 hover:bg-warm"}`}>
          <span className="flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{ticket.reference}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(ticket.status)}`}>{statusLabels[ticket.status]}</span></span>
          <span className="mt-2 block break-words text-sm font-semibold text-ink">{ticket.subject}</span><span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-stone-600">{ticket.lastMessage.preview}</span><span className="mt-2 block text-[11px] text-stone-500">Updated {dateLabel(ticket.updatedAt)}</span>
        </button>)}</div> : <div className="py-9 text-center"><MessageCircle className="mx-auto text-stone-400" size={30} aria-hidden="true" /><p className="mt-3 text-sm font-semibold">No support requests yet</p><p className="mt-1 text-xs leading-5 text-stone-500">Start a request and replies will appear here.</p></div>}
      </section>

      <section aria-label="Support conversation" className="flex min-h-[420px] min-w-0 flex-col rounded-card border border-ink/10 bg-white p-4 sm:p-6">
        {detail ? <>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-4"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{detail.reference} · {categories.find((item) => item.value === detail.category)?.label || "Support"}</p><h2 className="mt-2 break-words text-xl font-semibold">{detail.subject}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(detail.status)}`}>{statusLabels[detail.status]}</span></div>
          <div className="flex-1 space-y-4 overflow-y-auto py-5" aria-live="polite">{detail.messages.map((item) => <article key={item.id} className={`max-w-[92%] rounded-card p-4 ${item.authorType === "customer" ? "ml-auto bg-ink text-white" : "mr-auto border border-ink/10 bg-warm text-ink"}`}><div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><p className="text-xs font-bold">{item.authorType === "customer" ? "You" : "De Jadon Support"}</p><time className={`text-[10px] ${item.authorType === "customer" ? "text-stone-300" : "text-stone-500"}`}>{dateLabel(item.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.body}</p></article>)}</div>
          {detail.status === "resolved" ? <p className="rounded-lg bg-green-50 p-4 text-sm leading-6 text-green-900">This request is resolved. Reply below if you still need help, and we will reopen it.</p> : null}
          <form onSubmit={sendReply} className="border-t border-ink/10 pt-4"><label className="block text-sm font-semibold" htmlFor="support-reply">{detail.status === "resolved" ? "Reply to reopen this request" : "Your reply"}</label><textarea id="support-reply" required maxLength={4000} rows={3} className={`${inputClass} resize-y`} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply…" /><div className="mt-3 flex justify-end"><button type="submit" disabled={busy || !reply.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-card bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} aria-hidden="true" />{busy ? "Sending…" : "Send reply"}</button></div></form>
        </> : <div className="m-auto max-w-sm py-12 text-center"><MessageCircle className="mx-auto text-stone-400" size={34} aria-hidden="true" /><h2 className="mt-4 text-xl">Your support conversation</h2><p className="mt-2 text-sm leading-6 text-stone-600">{loading ? "Loading…" : "Choose a request to read the conversation, or start a new request."}</p></div>}
      </section>
    </div>
  </div>;
}
