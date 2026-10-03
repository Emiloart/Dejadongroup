import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { DashboardCard } from "@/components/dashboard-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { dashboardHighlights, dashboardLabels, dashboardSections, validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

type DashboardPageProps = { params: { role: DashboardRole } };

export function generateStaticParams() {
  return validDashboardRoles.map((role) => ({ role }));
}

function cardId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function DashboardPage({ params }: DashboardPageProps) {
  if (!validDashboardRoles.includes(params.role)) notFound();

  const sections = dashboardSections[params.role];
  const highlights = dashboardHighlights[params.role];

  return (
    <DashboardLayout role={params.role}>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Account overview</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">{dashboardLabels[params.role]}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">This is a preview of the {params.role} dashboard. Account details are not available yet.</p>
      </div>

      <nav aria-label="Overview shortcuts" className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ink/10 py-6 xl:grid-cols-4">
        {highlights.map((highlight) => (
          <Link key={highlight} href={`#${cardId(highlight)}`} className="group flex min-w-0 items-start justify-between gap-3">
            <span>
              <span className="block text-sm font-medium text-stone-600 group-hover:text-orangeAction">{highlight}</span>
              <span className="mt-2 block text-sm text-stone-400">Not available</span>
            </span>
            <ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-orangeAction opacity-60 transition group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="mt-14 space-y-14 lg:mt-20 lg:space-y-20">
        {sections.map((section) => (
          <section key={section.label} id={`section-${cardId(section.label)}`} aria-labelledby={`heading-${cardId(section.label)}`} className="scroll-mt-8 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
            <h2 id={`heading-${cardId(section.label)}`} className="mb-6 text-2xl font-medium tracking-tight text-ink lg:mb-0">{section.label}</h2>
            <div className="min-w-0">
              {section.items.map((card) => <DashboardCard key={card.title} card={card} id={cardId(card.title)} />)}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
