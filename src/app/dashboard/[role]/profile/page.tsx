import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardProfileEditor } from "@/components/dashboard-profile-editor";
import { validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

type ProfilePageProps = { params: { role: DashboardRole } };

export function generateStaticParams() {
  return validDashboardRoles.map((role) => ({ role }));
}

export default function ProfilePage({ params }: ProfilePageProps) {
  if (!validDashboardRoles.includes(params.role)) notFound();

  return (
    <DashboardLayout role={params.role} page="profile">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Account details</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Your profile</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">Keep your identity and sharing tools together. This browser-local preview does not connect to a live account.</p>
      <DashboardProfileEditor role={params.role} />
      <div id="referral-link" className="mt-10 border-t border-ink/10 py-6">
        <h2 className="text-2xl font-medium text-ink">Referral tools</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Your shareable link and QR code will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
