"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, Copy, KeyRound, Save, Trash2 } from "lucide-react";
import { clientDate, processStatuses, withdrawalStatuses, type AdminClient, type ClientDetails, type ClientWithdrawal } from "@/lib/client-types";

type Draft = Omit<ClientDetails, "id" | "balance" | "withdrawals" | "createdAt" | "updatedAt" | "activatedAt"> & {
  balance: string;
  withdrawals: (Omit<ClientWithdrawal, "amount"> & { amount: string })[];
};

function draftFor(client?: AdminClient): Draft {
  return {
    fullName: client?.fullName || "", email: client?.email || "", phone: client?.phone || "", verified: client?.verified || false,
    propertyName: client?.propertyName || "", propertyLocation: client?.propertyLocation || "", propertyReference: client?.propertyReference || "",
    investmentName: client?.investmentName || "", investmentDetails: client?.investmentDetails || "", investmentProgress: client?.investmentProgress || 0,
    actualDateLabel: client?.actualDateLabel || "Actual Date", actualDate: client?.actualDate || "", balance: client?.balance == null ? "" : String(client.balance),
    processes: client?.processes.map((item) => ({ ...item })) || [], withdrawals: client?.withdrawals.map((item) => ({ ...item, amount: String(item.amount) })) || []
  };
}

const inputClass = "mt-2 min-h-11 w-full rounded-card border border-ink/20 bg-white px-3 py-2.5 text-base font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-orange-700 disabled:bg-stone-100 sm:text-sm";
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-card border border-ink/20 bg-white px-4 text-sm font-semibold hover:border-orange-700 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:opacity-50";

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}{hint ? <span className="mt-2 block text-xs font-normal leading-6 text-stone-600">{hint}</span> : null}</label>;
}

function FormSection({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <section className="border-t border-ink/10 pt-7"><h3 className="text-xl">{title}</h3>{description ? <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p> : null}<div className="mt-5 space-y-5">{children}</div></section>;
}

export function AdminClientManager({ initialClients }: { initialClients: AdminClient[] }) {
  const [clients, setClients] = useState(initialClients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftFor());
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const selected = clients.find((client) => client.id === selectedId);
  const filtered = clients.filter((client) => `${client.fullName} ${client.email} ${client.propertyReference}`.toLowerCase().includes(search.trim().toLowerCase()));

  function select(client?: AdminClient) {
    setSelectedId(client?.id || null); setDraft(draftFor(client)); setDirty(false); setError(""); setNotice(""); setIssuedToken(null);
  }
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value })); setDirty(true); setNotice(""); setIssuedToken(null);
  }
  function accept(client: AdminClient) {
    setClients((current) => current.some((item) => item.id === client.id) ? current.map((item) => item.id === client.id ? client : item) : [...current, client]);
    setSelectedId(client.id); setDraft(draftFor(client)); setDirty(false);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(""); setNotice(""); setIssuedToken(null);
    try {
      const response = await fetch(selectedId ? `/api/admin/clients/${selectedId}` : "/api/admin/clients", { method: selectedId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The client record could not be saved.");
      accept(result.client); setNotice("Client record saved. Dashboard updates are available when the client refreshes their page.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function tokenAction(action: "issue" | "revoke") {
    if (!selected || dirty || busy) return;
    setBusy(true); setError(""); setNotice(""); setIssuedToken(null);
    try {
      const response = await fetch(`/api/admin/clients/${selected.id}/token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The token could not be updated.");
      accept(result.client); setIssuedToken(result.token);
      setNotice(action === "issue" ? "Token issued. Copy it now and provide it directly to the verified client." : "Activation token revoked.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function copyToken() {
    if (!issuedToken) return;
    try { await navigator.clipboard.writeText(issuedToken); setNotice("Activation token copied."); }
    catch { setNotice("Select the token below and copy it manually."); }
  }

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Agro-Real Estate</p><h1 className="mt-3 text-4xl tracking-tight">Clients</h1><p className="mt-4 text-sm leading-7 text-stone-600">Upload the client’s information, verify it, then issue a token. Manage the property, investment and account updates they see in their dashboard.</p></div><button type="button" onClick={() => select()} disabled={busy} className={buttonClass}><Plus aria-hidden="true" className="h-4 w-4" /> New client</button></div>
    <div className="mt-8 grid items-start gap-7 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside aria-label="Client records" className="min-w-0 rounded-card border border-ink/10 bg-white p-4">
        <label className="block text-xs font-semibold">Search clients<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email or reference" className={inputClass} /></label>
        <p className="mt-4 text-xs text-stone-500">{clients.length} client {clients.length === 1 ? "record" : "records"}</p>
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto xl:max-h-[65vh]">{filtered.map((client) => <button key={client.id} type="button" disabled={busy} aria-pressed={selectedId === client.id} onClick={() => select(client)} className={`block w-full rounded-card border-l-2 px-3 py-3 text-left ${selectedId === client.id ? "border-orangeAction bg-orange-50" : "border-transparent hover:bg-stone-50"}`}><span className="block break-words text-sm font-semibold">{client.fullName}</span><span className="mt-1 block break-all text-xs leading-5 text-stone-600">{client.email || "Email chosen on activation"}</span><span className="mt-2 block text-xs text-stone-500">{client.activatedAt ? client.verified ? "Active account" : "Access suspended" : client.verified ? "Verified · awaiting activation" : "Awaiting verification"}</span></button>)}{!filtered.length ? <p className="py-4 text-sm leading-6 text-stone-500">{clients.length ? "No matching clients." : "Add your first client record to get started."}</p> : null}</div>
      </aside>
      <div className="min-w-0 rounded-card border border-ink/10 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">{selected ? selected.fullName : "New client record"}</h2><span className="text-xs text-stone-500">{dirty ? "Unsaved changes" : selected ? "Saved record" : "Not saved yet"}</span></div>
        {error ? <p role="alert" className="mt-5 rounded-card bg-red-50 p-4 text-sm leading-7 text-red-800">{error}</p> : null}
        {notice ? <p role="status" className="mt-5 rounded-card bg-green-50 p-4 text-sm leading-7 text-green-800">{notice}</p> : null}
        <form onSubmit={save} className="mt-7">
          <fieldset disabled={busy} className="min-w-0 space-y-8">
            <legend className="sr-only">Client details</legend>
            <FormSection title="Verified information">
              <Field label="Full name"><input required maxLength={120} value={draft.fullName} onChange={(event) => change("fullName", event.target.value)} className={inputClass} /></Field>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Email address" hint={selected?.activatedAt ? "The client manages their email in their profile." : "Optional. If entered, the client must use this email to activate."}><input type="email" maxLength={254} readOnly={Boolean(selected?.activatedAt)} value={draft.email} onChange={(event) => change("email", event.target.value)} className={`${inputClass} read-only:bg-stone-100`} /></Field><Field label="Phone number"><input type="tel" maxLength={40} value={draft.phone} onChange={(event) => change("phone", event.target.value)} className={inputClass} /></Field></div>
              <label className="flex items-start gap-3 rounded-card bg-warm p-4 text-sm"><input type="checkbox" checked={draft.verified} onChange={(event) => change("verified", event.target.checked)} className="mt-1 h-4 w-4 accent-orange-700" /><span><span className="font-semibold">Client information has been verified by De Jadon Group</span><span className="mt-1 block text-xs leading-6 text-stone-600">Save verification before issuing a token. Removing verification revokes pending tokens and signs this client out.</span></span></label>
            </FormSection>
            <FormSection title="Property">
              <Field label="Property name"><input maxLength={200} value={draft.propertyName} onChange={(event) => change("propertyName", event.target.value)} className={inputClass} /></Field>
              <Field label="Property location" hint="Use a complete address or coordinates so the client can open the location on a map."><textarea rows={3} maxLength={500} value={draft.propertyLocation} onChange={(event) => change("propertyLocation", event.target.value)} className={inputClass} /></Field>
              <Field label="Property / allocation reference"><input maxLength={120} value={draft.propertyReference} onChange={(event) => change("propertyReference", event.target.value)} className={inputClass} /></Field>
            </FormSection>
            <FormSection title="Investment Plan">
              <Field label="Plan name"><input maxLength={200} value={draft.investmentName} onChange={(event) => change("investmentName", event.target.value)} className={inputClass} /></Field>
              <Field label="Plan details"><textarea rows={4} maxLength={3000} value={draft.investmentDetails} onChange={(event) => change("investmentDetails", event.target.value)} className={inputClass} /></Field>
              <Field label="Investment progress (%)"><input type="number" min={0} max={100} step="any" required value={draft.investmentProgress} onChange={(event) => change("investmentProgress", Number(event.target.value))} className={inputClass} /></Field>
            </FormSection>
            <FormSection title="Actual Date & Balance" description="Choose your own date label. Leave the date or balance empty until it is available.">
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Date label"><input required maxLength={100} value={draft.actualDateLabel} onChange={(event) => change("actualDateLabel", event.target.value)} className={inputClass} /></Field><Field label="Actual date"><input type="date" value={draft.actualDate} onChange={(event) => change("actualDate", event.target.value)} className={inputClass} /></Field></div>
              <Field label="Balance (NGN)" hint="The recorded balance is displayed as entered."><input type="number" min={0} max="9999999999.99" step="0.01" value={draft.balance} onChange={(event) => change("balance", event.target.value)} className={inputClass} /></Field>
            </FormSection>
            <FormSection title="Processes" description="Track each step with its current status. Steps appear in the order you add them.">
              {draft.processes.map((item, index) => <fieldset key={item.id} className="min-w-0 rounded-card border border-ink/15 p-4"><legend className="px-2 text-xs font-semibold">Process {index + 1}</legend><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]"><Field label="Step title"><input required maxLength={120} value={item.title} onChange={(event) => change("processes", draft.processes.map((step) => step.id === item.id ? { ...step, title: event.target.value } : step))} className={inputClass} /></Field><Field label="Process status"><select value={item.status} onChange={(event) => change("processes", draft.processes.map((step) => step.id === item.id ? { ...step, status: event.target.value as typeof item.status } : step))} className={`${inputClass} capitalize`}>{processStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field></div><div className="mt-4"><Field label="Step details"><textarea rows={2} maxLength={500} value={item.detail} onChange={(event) => change("processes", draft.processes.map((step) => step.id === item.id ? { ...step, detail: event.target.value } : step))} className={inputClass} /></Field></div><button type="button" onClick={() => change("processes", draft.processes.filter((step) => step.id !== item.id))} className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-red-700"><Trash2 aria-hidden="true" className="h-4 w-4" /> Remove process {index + 1}</button></fieldset>)}
              <button type="button" disabled={draft.processes.length >= 20} onClick={() => change("processes", [...draft.processes, { id: crypto.randomUUID(), title: "", detail: "", status: "pending" }])} className={buttonClass}><Plus aria-hidden="true" className="h-4 w-4" /> Add process step</button>
            </FormSection>
            <FormSection title="Withdrawal Requests" description="Record existing withdrawal requests and keep their status up to date.">
              {draft.withdrawals.map((item, index) => <fieldset key={item.id} className="min-w-0 rounded-card border border-ink/15 p-4"><legend className="px-2 text-xs font-semibold">Withdrawal {index + 1}</legend><div className="grid gap-4 sm:grid-cols-2"><Field label="Amount (NGN)"><input type="number" min="0.01" max="9999999999.99" step="0.01" required value={item.amount} onChange={(event) => change("withdrawals", draft.withdrawals.map((record) => record.id === item.id ? { ...record, amount: event.target.value } : record))} className={inputClass} /></Field><Field label="Request date"><input type="date" required value={item.date} onChange={(event) => change("withdrawals", draft.withdrawals.map((record) => record.id === item.id ? { ...record, date: event.target.value } : record))} className={inputClass} /></Field><Field label="Withdrawal status"><select value={item.status} onChange={(event) => change("withdrawals", draft.withdrawals.map((record) => record.id === item.id ? { ...record, status: event.target.value as typeof item.status } : record))} className={`${inputClass} capitalize`}>{withdrawalStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field><Field label="Reference"><input maxLength={120} value={item.reference} onChange={(event) => change("withdrawals", draft.withdrawals.map((record) => record.id === item.id ? { ...record, reference: event.target.value } : record))} className={inputClass} /></Field></div><div className="mt-4"><Field label="Withdrawal details"><textarea rows={2} maxLength={500} value={item.note} onChange={(event) => change("withdrawals", draft.withdrawals.map((record) => record.id === item.id ? { ...record, note: event.target.value } : record))} className={inputClass} /></Field></div><button type="button" onClick={() => change("withdrawals", draft.withdrawals.filter((record) => record.id !== item.id))} className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-red-700"><Trash2 aria-hidden="true" className="h-4 w-4" /> Remove withdrawal {index + 1}</button></fieldset>)}
              <button type="button" disabled={draft.withdrawals.length >= 50} onClick={() => change("withdrawals", [...draft.withdrawals, { id: crypto.randomUUID(), amount: "", date: "", reference: "", note: "", status: "pending" }])} className={buttonClass}><Plus aria-hidden="true" className="h-4 w-4" /> Add withdrawal record</button>
            </FormSection>
            <div className="border-t border-ink/10 pt-6"><button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-card bg-ink px-6 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{busy ? "Saving…" : "Save client record"}</button></div>
          </fieldset>
        </form>
        <section aria-labelledby="client-token-heading" className="mt-8 border-t border-ink/10 pt-7"><h3 id="client-token-heading" className="flex items-center gap-3 text-xl"><KeyRound aria-hidden="true" className="h-5 w-5 text-orange-700" /> Account activation token</h3>
          {selected?.activatedAt ? <p className="mt-4 text-sm leading-7 text-stone-600">Account activated on {clientDate(selected.activatedAt)}. This client signs in with their email and password.</p> : <><p className="mt-3 text-sm leading-7 text-stone-600">Tokens are single-use and expire after seven days. Issue a token after saving the verified record, then provide it directly to the client. Issuing another token invalidates the previous one.</p><p className="mt-3 text-xs text-stone-500">Status: {selected?.tokenStatus.replace(/-/g, " ") || "Save a client record first"}{selected?.tokenExpiresAt ? ` · Expires ${clientDate(selected.tokenExpiresAt)}` : ""}</p>{dirty ? <p className="mt-3 text-sm text-orange-800">Save your changes before managing the token.</p> : null}<div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy || dirty || !selected?.verified} onClick={() => tokenAction("issue")} className={buttonClass}><KeyRound aria-hidden="true" className="h-4 w-4" />{selected?.tokenStatus === "issued" || selected?.tokenStatus === "expired" ? "Issue replacement token" : "Issue activation token"}</button>{selected?.tokenStatus === "issued" ? <button type="button" disabled={busy || dirty} onClick={() => tokenAction("revoke")} className={buttonClass}>Revoke token</button> : null}</div></>}
          {issuedToken ? <div className="mt-5 rounded-card border border-orange-200 bg-orange-50 p-4"><label className="block text-xs font-semibold">Copy this token now — it will not be shown again<input readOnly value={issuedToken} onFocus={(event) => event.target.select()} className={`${inputClass} font-mono text-sm`} /></label><button type="button" onClick={copyToken} className={`${buttonClass} mt-4`}><Copy aria-hidden="true" className="h-4 w-4" /> Copy token</button></div> : null}
        </section>
      </div>
    </div>
  </div>;
}
