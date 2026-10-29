"use client";

import { useState } from "react";
import { clientDate, clientMoney, withdrawalStatuses, type ClientWithdrawal } from "@/lib/client-types";

export function ClientWithdrawals({ withdrawals }: { withdrawals: ClientWithdrawal[] }) {
  const [status, setStatus] = useState<"all" | ClientWithdrawal["status"]>("all");
  const filtered = withdrawals.filter((item) => status === "all" || item.status === status);
  return <div>
    <div className="flex flex-wrap gap-2" aria-label="Filter withdrawal requests">{(["all", ...withdrawalStatuses] as const).map((value) => <button key={value} type="button" aria-pressed={value === status} onClick={() => setStatus(value)} className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize ${status === value ? "bg-ink text-white" : "border border-ink/15 bg-white text-stone-600"}`}>{value === "all" ? "All requests" : value}<span className="ml-2 text-xs opacity-70">{withdrawals.filter((item) => value === "all" || item.status === value).length}</span></button>)}</div>
    {filtered.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{filtered.map((item) => <article key={item.id} className="min-w-0 rounded-card border border-ink/10 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-xl">{clientMoney(item.amount)}</h3><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${item.status === "successful" ? "bg-green-50 text-green-800" : item.status === "processing" ? "bg-orange-50 text-orange-800" : "bg-stone-100 text-stone-600"}`}>{item.status}</span></div><p className="mt-3 text-sm text-stone-600">{clientDate(item.date)}</p>{item.reference ? <p className="mt-2 break-words text-xs text-stone-500">Reference: {item.reference}</p> : null}{item.note ? <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600">{item.note}</p> : null}</article>)}</div> : <p className="mt-5 rounded-card border border-dashed border-ink/20 bg-white p-6 text-sm leading-7 text-stone-600">{withdrawals.length ? `No ${status} withdrawal requests.` : "No withdrawal requests have been recorded for your account."}</p>}
  </div>;
}
