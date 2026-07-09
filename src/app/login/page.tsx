"use client";

import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
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
        <div className="mx-auto grid max-w-5xl gap-6 rounded-card border border-orangeAction/20 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div className="grid content-between gap-8">
            <div>
              <SectionHeader title="Login" eyebrow="De Jadon Group" />
              <div className="mt-6">
                <ContentSlot label="Account Access Slot" />
              </div>
            </div>
            <ImageCanvas label="Login Image Canvas" compact />
          </div>
          <form className="rounded-card border border-stone-200 bg-warm p-5 sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orangeAction">Portal Access</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Choose Dashboard</h2>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Email
                <input className="min-h-11 rounded-card border border-stone-200 bg-white px-3 outline-none focus:border-orangeAction" type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Password
                <input className="min-h-11 rounded-card border border-stone-200 bg-white px-3 outline-none focus:border-orangeAction" type="password" />
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
