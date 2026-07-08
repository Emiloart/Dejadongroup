import { Building2, Handshake, Newspaper, Phone, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { BusinessCard } from "@/components/business-card";
import { ContentSlot } from "@/components/content-slot";
import { HomeBannerCarousel } from "@/components/home-banner-carousel";
import { HomeFaq } from "@/components/home-faq";
import { ImageCanvas } from "@/components/image-canvas";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses, homeBannerSlides, homeFaqSections, updateSections } from "@/lib/site-data";

export default function HomePage() {
  return (
    <SiteLayout>
      <PageSection className="pt-8 lg:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <SectionHeader title="De Jadon Group" eyebrow="Website Structure">
              <ContentSlot label="De Jadon Group Intro Slot" />
            </SectionHeader>
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
          <HomeBannerCarousel slides={homeBannerSlides} />
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader title="About De Jadon Group" eyebrow="About" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ContentSlot label="About De Jadon Group Content Slot" />
            <ImageCanvas label="About Image Canvas" compact />
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Building2 aria-hidden="true" className="h-6 w-6 text-orangeAction" />
            <SectionHeader title="Businesses" />
          </div>
          <ButtonLink href="/businesses" variant="outline">
            View Businesses
          </ButtonLink>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {businesses.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <UserRound aria-hidden="true" className="h-6 w-6 text-orangeAction" />
              <SectionHeader title="CEO" />
            </div>
            <div className="mt-6">
              <ContentSlot label="CEO Profile Slot" />
            </div>
          </div>
          <ImageCanvas label="CEO Image Canvas" />
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-card border border-orangeAction/20 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Handshake aria-hidden="true" className="h-7 w-7 text-orangeAction" />
            <h2 className="mt-4 text-xl font-semibold">Partner Program</h2>
            <div className="mt-4">
              <ContentSlot label="Partner Program Homepage Slot" />
            </div>
            <div className="mt-5">
              <ButtonLink href="/partner-program">Open Partner Program</ButtonLink>
            </div>
          </div>
          <div className="rounded-card border border-orangeAction/20 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Phone aria-hidden="true" className="h-7 w-7 text-orangeAction" />
            <h2 className="mt-4 text-xl font-semibold">Contact</h2>
            <div className="mt-4">
              <ContentSlot label="Contact Homepage Slot" />
            </div>
            <div className="mt-5">
              <ButtonLink href="/contact" variant="outline">
                Open Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex items-start gap-3">
            <Newspaper aria-hidden="true" className="mt-2 h-6 w-6 text-orangeAction" />
            <SectionHeader title="News & Updates" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {updateSections.map((section) => (
              <article key={section} className="rounded-card border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">{section}</h2>
                <div className="mt-4">
                  <ImageCanvas label={`${section} Image Canvas`} compact />
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <SectionHeader title="FAQ" />
          <HomeFaq sections={homeFaqSections} />
        </div>
      </PageSection>
    </SiteLayout>
  );
}
