"use client";

import { useRouter } from "next/navigation";
import { signOutPreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

export function DashboardSignOut({ role }: { role: DashboardRole }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center text-sm font-semibold text-orangeAction hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current lg:text-orange-700 lg:hover:text-ink"
      onClick={() => {
        signOutPreviewAccount(role);
        router.replace("/login?role=" + role);
      }}
    >
      Sign out
    </button>
  );
}
