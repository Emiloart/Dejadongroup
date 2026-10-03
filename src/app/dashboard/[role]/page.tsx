import { notFound } from "next/navigation";
import { DashboardCard } from "@/components/dashboard-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { dashboardHighlights, dashboardSections, validDashboardRoles } from "@/lib/dashboard-data";
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
      <section className="mb-14" aria-labelledby="dashboard-overview">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orangeAction">Overview</p>
        <h2 id="dashboard-overview" className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          {params.role === "partner" ? "Partner Portal" : "Client Portal"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Account details are not available in this preview. Fields marked with a dash have no data to display.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-stone-200 py-6 xl:grid-cols-4">
          {highlights.map((highlight) => (
            <div key={highlight}>
              <dt className="text-sm text-stone-600">{highlight}</dt>
              <dd className="mt-2 text-xl text-stone-400">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not available</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-10">
        {sections.map((section) => (
          <section key={section.label} aria-labelledby={`section-${cardId(section.label)}`}>
            <h2 id={`section-${cardId(section.label)}`} className="mb-6 scroll-mt-8 text-xl font-semibold tracking-tight text-ink">
              {section.label}
            </h2>
            <div className="grid gap-x-10 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
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
