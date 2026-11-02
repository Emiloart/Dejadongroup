"use client";

import { CheckCircle2, LifeBuoy, MessageCircle, RotateCw, Send, StickyNote } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Permission } from "@/lib/admin-permissions";
import type { AdminTicketDetail, AdminTicketSummary, SupportStatus } from "@/lib/support-store";
import { AdminFeedback, adminButton, adminInput, adminPanel } from "@/components/admin-workspace-ui";

type Counts = { total: number; open: number; inProgress: number; awaitingCustomer: number; resolved: number };
type Filter = "all" | SupportStatus;
const labels: Record<SupportStatus, string> = { open: "Needs team", in_progress: "In progress", awaiting_customer: "Awaiting customer", resolved: "Resolved" };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Casablanca", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusClass(status: SupportStatus) {
  if (status === "resolved") return "bg-green-50 text-green-800";
  if (status === "awaiting_customer") return "bg-amber-50 text-amber-900";
  return "bg-orange-50 text-orange-900";
}

export function AdminSupportDashboard({ permissions }: { permissions: Permission[] }) {
  const canReply = permissions.includes("support.respond");
  const canAssign = permissions.includes("support.assign");
  const canResolve = permissions.includes("support.resolve");
  const canManageNotes = permissions.includes("support.notes.manage");
  const canTakeOver = permissions.includes("admin.roles.manage");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [tickets, setTickets] = useState<AdminTicketSummary[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, open: 0, inProgress: 0, awaitingCustomer: 0, resolved: 0 });
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadQueue = useCallback(async (preferredId = "") => {
    setError("");
    try {
      const response = await fetch(`/api/admin/support?status=${filter}&q=${encodeURIComponent(appliedQuery)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load support requests.");
      const rows = result.tickets as AdminTicketSummary[];
      setTickets(rows); setCounts(result.counts);
      const target = rows.some((item) => item.id === preferredId) ? preferredId : rows[0]?.id || "";
      setSelectedId(target);
      if (target) {
        const selected = await fetch(`/api/admin/support/${encodeURIComponent(target)}`, { cache: "no-store" });
        const selectedResult = await selected.json();
        if (!selected.ok) throw new Error(selectedResult.error || "Could not load this support request.");
        setDetail(selectedResult.ticket as AdminTicketDetail);
      } else setDetail(null);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not load support."); }
    finally { setLoading(false); }
  }, [filter, appliedQuery]);

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  async function selectTicket(id: string) {
    setBusy(true); setError(""); setNotice(""); setSelectedId(id);
    try {
      const response = await fetch(`/api/admin/support/${encodeURIComponent(id)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load this support request.");
      setDetail(result.ticket as AdminTicketDetail);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not load this support request."); }
    finally { setBusy(false); }
  }

  async function act(action: "claim" | "reply" | "note" | "resolve", message = "") {
    if (!detail) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/support/${encodeURIComponent(detail.id)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this request.");
      setDetail(result.ticket as AdminTicketDetail);
      if (action === "reply") setReply("");
      if (action === "note") setNote("");
      setNotice(action === "claim" ? "You are now assigned to this request." : action === "reply" ? "Your reply has been sent." : action === "note" ? "Internal note saved." : "Request marked as resolved.");
      await loadQueue(detail.id);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not update this request."); }
    finally { setBusy(false); }
  }

  function submitReply(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void act("reply", reply); }
  function submitNote(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void act("note", note); }
  const selected = detail;
  const canTakeSelected = canAssign && selected && selected.status !== "resolved" && (!selected.assignedToName || selected.assignedToMe || canTakeOver);
  const canWorkSelected = Boolean(selected && (selected.assignedToMe || canTakeOver));

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Company workspace</p><h1 className="mt-3 text-4xl tracking-tight">Customer support</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Review dashboard requests, keep replies in the ticket, and resolve each issue with an auditable status.</p></div>
      <button type="button" onClick={() => void loadQueue(selectedId)} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-card border border-ink/15 bg-white px-4 text-sm font-semibold hover:bg-warm disabled:opacity-50"><RotateCw size={16} aria-hidden="true" />Refresh queue</button>
    </div>

    <AdminFeedback error={error} notice={notice} />

    <section aria-label="Support request totals" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {[{ label: "All requests", count: counts.total }, { label: "Needs team", count: counts.open }, { label: "In progress", count: counts.inProgress }, { label: "Awaiting customer", count: counts.awaitingCustomer }, { label: "Resolved", count: counts.resolved }].map((item) => <article key={item.label} className={`${adminPanel} p-4`}><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{item.label}</p><p className="mt-2 text-3xl font-semibold">{item.count}</p></article>)}
    </section>

    <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.5fr)]">
      <section aria-labelledby="support-queue-heading" className={`${adminPanel} min-w-0 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="support-queue-heading" className="text-xl">Request queue</h2><span className="text-xs text-stone-500">{tickets.length} shown · latest 100</span></div>
        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); setAppliedQuery(query.trim()); }}><label htmlFor="support-search" className="sr-only">Search support requests</label><input id="support-search" className={adminInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, subject or ref" /><button className="min-h-11 rounded-lg border border-ink/15 px-3 text-sm font-semibold hover:bg-warm">Search</button></form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filter support requests">{(["all", "open", "in_progress", "awaiting_customer", "resolved"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold ${filter === value ? "bg-ink text-white" : "bg-warm text-stone-700 hover:bg-stone-200"}`}>{value === "all" ? "All" : labels[value]}</button>)}</div>
        {loading && !tickets.length ? <p role="status" className="py-8 text-sm text-stone-500">Loading requests…</p> : tickets.length ? <div className="mt-3 max-h-[780px] space-y-2 overflow-y-auto">{tickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => void selectTicket(ticket.id)} className={`block w-full rounded-lg border p-4 text-left transition ${selectedId === ticket.id ? "border-agriculture bg-green-50/60" : "border-ink/10 hover:border-ink/25 hover:bg-warm"}`}>
          <span className="flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{ticket.reference}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(ticket.status)}`}>{labels[ticket.status]}</span></span>
          <span className="mt-2 block break-words text-sm font-semibold">{ticket.subject}</span><span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-stone-600">{ticket.requester.name} · {ticket.requester.role === "client" ? "Client" : "Partner"}{ticket.requester.email ? ` · ${ticket.requester.email}` : ""}</span><span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-stone-500">{ticket.lastMessage.preview}</span><span className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-stone-500"><span>{ticket.assignedToName ? `Assigned to ${ticket.assignedToName}` : "Unassigned"}</span><time>{dateLabel(ticket.updatedAt)}</time></span>
        </button>)}</div> : <div className="py-10 text-center"><LifeBuoy className="mx-auto text-stone-400" size={30} aria-hidden="true" /><p className="mt-3 text-sm font-semibold">No requests in this view</p><p className="mt-1 text-xs text-stone-500">New dashboard requests will appear here.</p></div>}
      </section>

      <section aria-label="Support request details" className={`${adminPanel} min-w-0 p-4 sm:p-6`}>
        {selected ? <>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{selected.reference} · {selected.requester.role === "client" ? "Client" : "Partner"} · {selected.category.replaceAll("_", " ")}</p><h2 className="mt-2 break-words text-2xl">{selected.subject}</h2><p className="mt-2 break-words text-sm text-stone-600">{selected.requester.name}{selected.requester.email ? ` · ${selected.requester.email}` : ""}</p><p className="mt-1 text-xs text-stone-500">Opened {dateLabel(selected.createdAt)} · Updated {dateLabel(selected.updatedAt)}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(selected.status)}`}>{labels[selected.status]}</span></div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-warm p-3"><p className="text-sm text-stone-700">{selected.assignedToName ? <>Assigned to <strong>{selected.assignedToName}</strong></> : "This request has not been assigned."}</p>{canTakeSelected ? <button type="button" disabled={busy || selected.assignedToMe} onClick={() => void act("claim")} className={`${adminButton} min-h-10`}>
            {selected.assignedToMe ? "Assigned to you" : selected.assignedToName ? "Take over request" : "Take request"}
          </button> : null}</div>

          <div className="mt-5 max-h-[540px] space-y-4 overflow-y-auto pr-1" aria-live="polite">{selected.messages.map((item) => <article key={item.id} className={`max-w-[96%] rounded-card p-4 ${item.authorType === "staff" ? "ml-auto bg-ink text-white" : "mr-auto border border-ink/10 bg-white"}`}><div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><p className="text-xs font-bold">{item.authorType === "customer" ? `${item.authorName} · customer` : item.authorName}</p><time className={`text-[10px] ${item.authorType === "staff" ? "text-stone-300" : "text-stone-500"}`}>{dateLabel(item.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.body}</p></article>)}</div>

          {canReply && selected.status !== "resolved" && canWorkSelected ? <form onSubmit={submitReply} className="mt-5 border-t border-ink/10 pt-5"><label htmlFor="support-agent-reply" className="block text-sm font-semibold">Reply to customer</label><textarea id="support-agent-reply" required maxLength={4000} rows={4} className={`${adminInput} resize-y`} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a clear response for the customer." /><button type="submit" disabled={busy || !reply.trim()} className={`${adminButton} mt-3 inline-flex items-center gap-2`}><Send size={15} aria-hidden="true" />{busy ? "Sending…" : "Send reply"}</button></form> : null}

          {canManageNotes && canWorkSelected && selected.status !== "resolved" ? <form onSubmit={submitNote} className="mt-4 rounded-lg border border-dashed border-ink/20 p-4"><label htmlFor="support-internal-note" className="flex items-center gap-2 text-sm font-semibold"><StickyNote size={16} aria-hidden="true" />Internal note, visible to support staff only</label><textarea id="support-internal-note" required maxLength={4000} rows={3} className={`${adminInput} resize-y`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add handoff context or internal follow-up." /><button type="submit" disabled={busy || !note.trim()} className="mt-3 min-h-10 rounded-lg border border-ink/15 px-4 text-sm font-semibold hover:bg-warm">Save internal note</button></form> : null}

          {selected.notes.length ? <section className="mt-5"><h3 className="text-sm font-semibold">Internal notes</h3><div className="mt-2 space-y-2">{selected.notes.map((item) => <article key={item.id} className="rounded-lg bg-amber-50 p-3 text-sm"><p className="whitespace-pre-wrap break-words leading-6">{item.body}</p><p className="mt-2 text-[11px] text-stone-600">{item.authorName} · {dateLabel(item.createdAt)}</p></article>)}</div></section> : null}

          {canResolve && canWorkSelected && selected.status !== "resolved" ? <div className="mt-5 flex justify-end border-t border-ink/10 pt-4"><button type="button" disabled={busy} onClick={() => void act("resolve")} className="inline-flex min-h-11 items-center gap-2 rounded-card border border-green-800/20 px-4 text-sm font-semibold text-green-900 hover:bg-green-50 disabled:opacity-50"><CheckCircle2 size={16} aria-hidden="true" />Mark resolved</button></div> : null}
        </> : <div className="m-auto max-w-sm py-16 text-center"><MessageCircle className="mx-auto text-stone-400" size={34} aria-hidden="true" /><h2 className="mt-4 text-xl">Request details</h2><p className="mt-2 text-sm leading-6 text-stone-600">Select a request from the queue to review the conversation and respond.</p></div>}
      </section>
    </div>
  </div>;
}
