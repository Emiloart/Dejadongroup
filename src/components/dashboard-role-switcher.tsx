"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { PortalAuthForm } from "@/components/portal-auth-form";
import { validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

export function DashboardRoleSwitcher({ role }: { role: DashboardRole }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<DashboardRole | null>(null);
  function close() { dialogRef.current?.close(); }
  function open(next: DashboardRole) { setTarget(next); dialogRef.current?.showModal(); }
  return <>
    <nav aria-label="Choose dashboard" className="flex gap-6 border-t border-white/10 px-5 lg:mt-7 lg:border-t-0 lg:border-b lg:border-white/15 lg:px-0">{validDashboardRoles.map((option) => option === role ? <span key={option} aria-current="true" className="min-h-11 border-b-2 border-orangeAction py-2 text-sm font-semibold capitalize text-white">{option}</span> : <button key={option} type="button" onClick={() => open(option)} aria-haspopup="dialog" className="min-h-11 border-b-2 border-transparent py-2 text-sm font-semibold capitalize text-stone-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{option}</button>)}</nav>
    <dialog ref={dialogRef} aria-label={target ? `Switch to ${target} dashboard` : "Switch dashboard"} onClose={() => setTarget(null)} onClick={(event) => { if (event.target === dialogRef.current) close(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-card border border-ink/10 bg-warm p-0 text-ink shadow-2xl backdrop:bg-ink/70">{target ? <div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Switch workspace</p><h2 className="mt-2 text-2xl capitalize">{target} dashboard</h2><p className="mt-2 text-sm leading-6 text-stone-600">Your {role} session stays signed in while you switch.</p></div><button type="button" onClick={close} aria-label="Close switch workspace" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-ink/5"><X aria-hidden="true" className="h-5 w-5" /></button></div><PortalAuthForm key={target} initialRole={target} hideRoleChooser onSuccess={close} /></div> : null}</dialog>
  </>;
}
