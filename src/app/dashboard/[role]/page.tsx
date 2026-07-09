import { notFound } from "next/navigation";
import { DashboardCard } from "@/components/dashboard-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { dashboardHighlights, dashboardSections, validDashboardRoles } from "@/lib/site-data";
import type { DashboardRole } from "@/types/site";

type DashboardPageProps = {
  params: {
    role: DashboardRole;
  };
};

export function generateStaticParams() {
  return validDashboardRoles.map((role) => ({ role }));
}

function cardId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function DashboardPage({ params }: DashboardPageProps) {
  if (!validDashboardRoles.includes(params.role)) {
    notFound();
  }

  const sections = dashboardSections[params.role];
  const highlights = dashboardHighlights[params.role];

  return (
    <DashboardLayout role={params.role}>
      <section className="mb-6 rounded-card border border-orangeAction/20 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orangeAction">Dashboard Overview</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">
              {params.role === "partner" ? "Partner Portal" : "Client Portal"}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-card border border-stone-100 bg-warm p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-stone-500">{highlight}</p>
                <div className="mt-3 h-2 w-2/3 rounded-full bg-stone-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8">
        {sections.map((section) => (
          <section key={section.label} aria-labelledby={cardId(section.label)}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1 w-10 rounded-full bg-orangeAction" />
              <h2 id={cardId(section.label)} className="text-xl font-semibold text-ink">
                {section.label}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.items.map((card) => (
                <DashboardCard key={card.title} card={card} id={cardId(card.title)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
