"use client";

import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import type { DashboardRole } from "@/types/site";

function DemoButton({
  dashboardRole,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { dashboardRole: DashboardRole }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="min-h-11 rounded-card bg-orangeAction px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
      onClick={() => router.push(`/dashboard/${dashboardRole}`)}
      {...props}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="mx-auto max-w-xl">
          <SectionHeader title="Login" />
          <form className="mt-8 rounded-card border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Email
                <input className="min-h-11 rounded-card border border-stone-200 px-3 outline-none focus:border-orangeAction" type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Password
                <input className="min-h-11 rounded-card border border-stone-200 px-3 outline-none focus:border-orangeAction" type="password" />
              </label>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <DemoButton dashboardRole="partner">Open Partner Dashboard</DemoButton>
                <DemoButton dashboardRole="client">Open Client Dashboard</DemoButton>
              </div>
            </div>
          </form>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
