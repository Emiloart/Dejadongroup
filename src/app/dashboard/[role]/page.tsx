import { notFound } from "next/navigation";
import { DashboardCard } from "@/components/dashboard-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { dashboardCards, validDashboardRoles } from "@/lib/site-data";
import type { DashboardRole } from "@/types/site";

type DashboardPageProps = {
  params: {
    role: DashboardRole;
  };
};

export function generateStaticParams() {
  return validDashboardRoles.map((role) => ({ role }));
}

export default function DashboardPage({ params }: DashboardPageProps) {
  if (!validDashboardRoles.includes(params.role)) {
    notFound();
  }

  const cards = dashboardCards[params.role];

  return (
    <DashboardLayout role={params.role}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <DashboardCard key={card.title} card={card} />
        ))}
      </div>
    </DashboardLayout>
  );
}
