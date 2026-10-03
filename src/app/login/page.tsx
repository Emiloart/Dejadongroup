import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const dashboards = [
  { role: "partner", name: "Partner dashboard", description: "Explore your partner account, network, and earnings." },
  { role: "client", name: "Client dashboard", description: "Explore your land records, farm updates, and reports." }
];

export default function LoginPage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="mx-auto grid max-w-5xl gap-12 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-12">
          <div>
            <SectionHeader as="h1" title="Your portal" eyebrow="De Jadon Group">
              <p>Choose a dashboard to explore the account experience.</p>
            </SectionHeader>
            <p className="mt-8 max-w-sm border-l-2 border-orangeAction/40 pl-4 text-sm leading-6 text-stone-600">
              Dashboard preview. Account sign-in is not available yet, and no credentials are needed.
            </p>
          </div>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {dashboards.map((dashboard) => (
              <Link
                key={dashboard.role}
                href={`/dashboard/${dashboard.role}`}
                className="group flex items-center justify-between gap-6 py-8"
              >
                <div>
                  <h2 className="text-2xl font-medium text-ink transition-colors group-hover:text-orangeAction">{dashboard.name}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">{dashboard.description}</p>
                  <span className="mt-5 inline-block text-sm font-semibold text-orangeAction">Open preview</span>
                </div>
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-orangeAction transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
