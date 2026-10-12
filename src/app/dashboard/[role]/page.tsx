import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { DashboardCard } from "@/components/dashboard-card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { dashboardHighlights, dashboardIntroductions, dashboardLabels, dashboardSections, validDashboardRoles } from "@/lib/dashboard-data";
import type { DashboardRole } from "@/types/site";

type DashboardPageProps = { params: { role: DashboardRole } };

export function generateStaticParams() {
  return validDashboardRoles.map((role) => ({ role }));
}

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function DashboardPage({ params }: DashboardPageProps) {
  if (!validDashboardRoles.includes(params.role)) notFound();

  const sections = dashboardSections[params.role];
  const highlights = dashboardHighlights[params.role];

  return (
    <DashboardLayout role={params.role} page="overview">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Account overview</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">{dashboardLabels[params.role]}</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">{dashboardIntroductions[params.role]}</p>
        </div>
        <Link href={"/dashboard/" + params.role + "/profile"} className="inline-flex min-h-11 items-center gap-2 border-b border-orangeAction pb-1 text-sm font-semibold text-orangeAction hover:text-orange-700">
          Set up profile <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <nav aria-label="Overview shortcuts" className="mt-10 grid gap-0 border-y border-ink/10 sm:grid-cols-3">
        {highlights.map((highlight) => (
          highlight.href ? (
            <Link key={highlight.label} href={highlight.href} className="group flex min-w-0 items-start justify-between gap-3 border-b border-ink/10 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
              <span>
                <span className="block text-sm font-semibold text-ink group-hover:text-orangeAction">{highlight.label}</span>
                <span className="mt-2 block text-sm leading-5 text-stone-600">{highlight.detail}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-orangeAction" />
            </Link>
          ) : (
            <div key={highlight.label} className="min-w-0 py-5 sm:px-5">
              <span className="block text-sm font-semibold text-ink">{highlight.label}</span>
              <span className="mt-2 block text-sm leading-5 text-stone-600">{highlight.detail}</span>
            </div>
          )
        ))}
      </nav>

      <div className="mt-14 space-y-14 lg:mt-16 lg:space-y-16">
        {sections.map((section) => {
          const id = sectionId(section.label);
          return (
            <section key={section.label} id={"section-" + id} aria-labelledby={"heading-" + id} className="scroll-mt-28 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
              <div className="mb-5 lg:mb-0">
                <h2 id={"heading-" + id} className="text-2xl font-medium tracking-tight text-ink">{section.label}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{section.description}</p>
              </div>
              <div className="min-w-0">
                {section.items.map((card) => <DashboardCard key={card.title} card={card} id={sectionId(card.title)} />)}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
