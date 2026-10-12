import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
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
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">This profile preview will hold your photo, name, username, user ID, and referral tools.</p>
      <div id="referral-link" className="mt-10 border-t border-ink/10 py-6">
        <h2 className="text-2xl font-medium text-ink">Referral tools</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Profile and referral setup is being added to this preview.</p>
      </div>
    </DashboardLayout>
  );
}
