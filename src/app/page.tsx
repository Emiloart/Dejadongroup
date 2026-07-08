import { Building2, Handshake, Phone } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { BusinessCard } from "@/components/business-card";
import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses } from "@/lib/site-data";

export default function HomePage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeader title="De Jadon Group" eyebrow="Website Structure" />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/businesses">Businesses</ButtonLink>
              <ButtonLink href="/partner-program" variant="outline">
                Partner Program
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact
              </ButtonLink>
            </div>
          </div>
          <ImageCanvas label="De Jadon Group Image Canvas" />
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="mb-8 flex items-center gap-3">
          <Building2 aria-hidden="true" className="h-6 w-6 text-orangeAction" />
          <SectionHeader title="Businesses" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-card border border-stone-200 bg-white p-6">
            <Handshake aria-hidden="true" className="h-7 w-7 text-orangeAction" />
            <h2 className="mt-4 text-xl font-semibold">Partner Program</h2>
            <div className="mt-5">
              <ButtonLink href="/partner-program">Open Partner Program</ButtonLink>
            </div>
          </div>
          <div className="rounded-card border border-stone-200 bg-white p-6">
            <Phone aria-hidden="true" className="h-7 w-7 text-orangeAction" />
            <h2 className="mt-4 text-xl font-semibold">Contact</h2>
            <div className="mt-5">
              <ButtonLink href="/contact" variant="outline">
                Open Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
