"use client";

import { useRouter } from "next/navigation";
import { signOutPreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

export function DashboardSignOut({ role }: { role: DashboardRole }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center text-sm font-semibold text-orangeAction hover:text-orange-700"
      onClick={() => {
        signOutPreviewAccount();
        router.replace("/login?role=" + role);
      }}
    >
      Sign out
    </button>
  );
}
