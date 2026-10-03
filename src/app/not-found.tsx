import { ButtonLink } from "@/components/button-link";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

export default function NotFound() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="py-12 sm:py-20">
          <SectionHeader as="h1" title="We couldn’t find that page" eyebrow="404">
            <p>The address may have changed. Explore our businesses or head back home.</p>
          </SectionHeader>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/businesses" variant="outline">Explore businesses</ButtonLink>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
