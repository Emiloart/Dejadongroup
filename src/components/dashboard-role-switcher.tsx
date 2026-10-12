"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { PortalAuthForm } from "@/components/portal-auth-form";
import { getCurrentPreviewAccount, type PreviewAccount } from "@/lib/preview-account";
import { validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

export function DashboardRoleSwitcher({ role }: { role: DashboardRole }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [targetRole, setTargetRole] = useState<DashboardRole | null>(null);
  const [existingAccount, setExistingAccount] = useState<PreviewAccount | null>(null);
  const [useAnotherAccount, setUseAnotherAccount] = useState(false);

  function openSwitch(target: DashboardRole) {
    setTargetRole(target);
    setExistingAccount(getCurrentPreviewAccount(target));
    setUseAnotherAccount(false);
    dialogRef.current?.showModal();
  }

  function closeSwitch() {
    dialogRef.current?.close();
  }

  function continueToTarget() {
    if (!targetRole) return;
    closeSwitch();
    router.push("/dashboard/" + targetRole);
  }

  const tabClass = "min-h-10 border-b-2 py-2 text-sm font-semibold capitalize transition-colors lg:min-h-11";

  return (
    <>
      <nav aria-label="Choose dashboard" className="flex gap-6 border-t border-white/10 px-5 lg:mt-7 lg:border-t-0 lg:border-b lg:border-white/15 lg:px-0">
        {validDashboardRoles.map((dashboardRole) => dashboardRole === role ? (
          <span key={dashboardRole} aria-current="true" className={`${tabClass} border-orangeAction text-white`}>
            {dashboardRole}
          </span>
        ) : (
          <button key={dashboardRole} type="button" onClick={() => openSwitch(dashboardRole)} aria-haspopup="dialog" className={`${tabClass} border-transparent text-stone-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>
            {dashboardRole}
          </button>
        ))}
      </nav>

      <dialog
        ref={dialogRef}
        aria-label={targetRole ? `Switch to ${targetRole} dashboard` : "Switch dashboard"}
        onClose={() => setTargetRole(null)}
        onClick={(event) => { if (event.target === dialogRef.current) closeSwitch(); }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-card border border-ink/10 bg-warm p-0 text-ink shadow-2xl backdrop:bg-ink/70"
      >
        {targetRole ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Switch workspace</p>
                <h2 className="mt-2 text-2xl font-medium">{targetRole === "client" ? "Client" : "Partner"} dashboard</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">Your {role} session stays signed in while you switch.</p>
              </div>
              <button type="button" onClick={closeSwitch} aria-label="Close switch workspace" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-600 hover:bg-ink/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {existingAccount && !useAnotherAccount ? (
              <div className="mt-7 border-t border-ink/10 pt-6">
                <p className="text-sm text-stone-600">Already signed in as <span className="font-semibold text-ink">@{existingAccount.username}</span></p>
                <button type="button" onClick={continueToTarget} className="mt-5 inline-flex min-h-11 items-center rounded-card bg-orangeAction px-6 text-sm font-semibold text-ink hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  Continue to {targetRole} dashboard
                </button>
                <button type="button" onClick={() => setUseAnotherAccount(true)} className="mt-3 block min-h-11 rounded-card text-sm font-semibold text-stone-600 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
                  Sign in or create another account
                </button>
              </div>
            ) : (
              <div className="mt-7 border-t border-ink/10 pt-5">
                {existingAccount ? <button type="button" onClick={() => setUseAnotherAccount(false)} className="mb-5 rounded-card text-sm font-semibold text-orange-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">Back to @{existingAccount.username}</button> : null}
                <PortalAuthForm key={targetRole} initialRole={targetRole} hideRoleChooser onSuccess={closeSwitch} />
              </div>
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
