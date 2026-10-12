"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentPreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

export function DashboardAccessGate({ role, children }: { role: DashboardRole; children: ReactNode }) {
  const router = useRouter();
  const [allowedRole, setAllowedRole] = useState<DashboardRole | null>(null);

  useEffect(() => {
    if (getCurrentPreviewAccount(role)) {
      setAllowedRole(role);
      return;
    }
    setAllowedRole(null);
    const next = window.location.pathname + window.location.search + window.location.hash;
    router.replace("/login?role=" + role + "&next=" + encodeURIComponent(next));
  }, [role, router]);

  if (allowedRole !== role) {
    return <div className="flex min-h-screen items-center justify-center bg-warm px-5 text-sm text-stone-600">Opening your portal…</div>;
  }
  return <>{children}</>;
}
