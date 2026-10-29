import { PortalAuthForm } from "@/components/portal-auth-form";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import type { DashboardRole } from "@/types/site";

type LoginPageProps = { searchParams?: { role?: string; next?: string } };

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
              Agro-Real Estate clients activate their account with a token issued by De Jadon Group after verification. The partner portal currently uses accounts saved on this device.
            </p>
          </div>
          <PortalAuthForm initialRole={initialRole} nextPath={searchParams?.next} />
        </div>
      </PageSection>
    </SiteLayout>
  );
}
