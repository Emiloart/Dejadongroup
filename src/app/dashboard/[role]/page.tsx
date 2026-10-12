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
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Account overview</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">{dashboardLabels[params.role]}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">{dashboardIntroductions[params.role]}</p>
      </div>

      <nav aria-label="Jump to dashboard sections" className="mt-8 border-y border-ink/10 py-3 lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">On this page</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {sections.map((section) => (
            <a key={section.label} href={"#section-" + sectionId(section.label)} className="inline-flex min-h-11 items-center border-b border-orangeAction/60 text-sm font-semibold text-ink hover:border-orangeAction hover:text-orange-700">
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Quick access</p>
      <nav aria-label="Quick access" className="mt-3 grid gap-0 border-y border-ink/10 sm:grid-cols-3">
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

      <div className="mt-12 space-y-12 lg:mt-14 lg:space-y-14">
        {sections.map((section) => {
          const id = sectionId(section.label);
          return (
            <section key={section.label} id={"section-" + id} aria-labelledby={"heading-" + id} className="scroll-mt-28 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
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
