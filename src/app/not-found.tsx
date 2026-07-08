import { ButtonLink } from "@/components/button-link";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

export default function NotFound() {
  return (
    <SiteLayout>
      <PageSection>
        <SectionHeader title="Page Not Found" />
        <div className="mt-8">
          <ButtonLink href="/">Home</ButtonLink>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
