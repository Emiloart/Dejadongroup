import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardProfileEditor } from "@/components/dashboard-profile-editor";
import { DashboardReferralTools } from "@/components/dashboard-referral-tools";
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Account details</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Your profile</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">Manage your details and share your link from one place.</p>
      <DashboardProfileEditor role={params.role} />
      <DashboardReferralTools role={params.role} />
    </DashboardLayout>
  );
}
