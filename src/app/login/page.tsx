import { PortalAuthForm } from "@/components/portal-auth-form";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import type { DashboardRole } from "@/types/site";

type LoginPageProps = { searchParams?: { role?: string; next?: string; mode?: string; ref?: string } };

export const metadata = { title: "Your portal", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: LoginPageProps) {
  const initialRole: DashboardRole = searchParams?.role === "client" ? "client" : "partner";

  return (
    <SiteLayout>
      <PageSection>
        <div className="mx-auto grid max-w-5xl gap-10 py-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-12">
          <div>
            <SectionHeader as="h1" title="Your portal" eyebrow="De Jadon Group">
              <p>Sign in to your client or partner workspace.</p>
            </SectionHeader>
            <p className="mt-8 max-w-sm border-l-2 border-orangeAction/40 pl-4 text-sm leading-6 text-stone-600">
              Agro-Real Estate clients activate with a De Jadon Group token. Partners verify their email, complete their details, and register for a tier before accessing their dashboard.
            </p>
          </div>
          <PortalAuthForm initialRole={initialRole} initialMode={searchParams?.mode === "signup" ? "signup" : "signin"} referral={searchParams?.ref} nextPath={searchParams?.next} />
        </div>
      </PageSection>
    </SiteLayout>
  );
}
