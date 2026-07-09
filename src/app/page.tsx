import { Building2, Handshake, Newspaper, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { BusinessCarousel } from "@/components/business-carousel";
import { ContentSlot } from "@/components/content-slot";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomeFaq } from "@/components/home-faq";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { businesses, homeFaqSections, homeHeroSlides, updateSections } from "@/lib/site-data";

export default function HomePage() {
  return (
    <SiteLayout>
      <PageSection className="pt-8 lg:pt-12">
        <HomeHeroCarousel slides={homeHeroSlides} />
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
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.75fr_0.25fr] lg:items-end">
          <div className="flex items-center gap-3">
            <Building2 aria-hidden="true" className="h-6 w-6 text-orangeAction" />
            <SectionHeader title="Businesses" />
          </div>
          <div className="lg:justify-self-end">
            <ButtonLink href="/businesses" variant="outline">
              View Businesses
            </ButtonLink>
          </div>
        </div>
        <BusinessCarousel businesses={businesses} />
      </PageSection>

      <PageSection>
        <div className="rounded-card border border-orangeAction/20 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="flex items-start gap-3">
              <Handshake aria-hidden="true" className="mt-2 h-7 w-7 text-orangeAction" />
              <SectionHeader title="Partner Program" eyebrow="Growth" />
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <ContentSlot label="Partner Program Homepage Slot" />
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <ButtonLink href="/partner-program">Open Partner Program</ButtonLink>
                <ButtonLink href="/login" variant="outline">
                  Login
                </ButtonLink>
              </div>
            </div>
          </div>
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
        <div className="rounded-card border border-orangeAction/20 bg-ink p-5 text-white shadow-sm sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Call To Action</p>
              <h2 className="mt-3 text-3xl font-semibold">De Jadon Group</h2>
              <div className="mt-5 h-1 w-16 rounded-full bg-orangeAction" />
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-card border border-white/10 bg-white/5 p-5 text-sm font-semibold text-stone-200">
                De Jadon Group CTA Slot
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <ButtonLink href="/contact">Contact</ButtonLink>
                <ButtonLink href="/businesses" variant="outline">
                  Businesses
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection tinted>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex items-start gap-3">
            <Newspaper aria-hidden="true" className="mt-2 h-6 w-6 text-orangeAction" />
            <SectionHeader title="News & Updates" eyebrow="Blog" />
          </div>
          <div className="grid gap-4">
            <article className="rounded-card border border-orangeAction/20 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-orangeAction">Featured Update</p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">News & Updates</h2>
                  <div className="mt-5">
                    <ContentSlot label="Featured Update Slot" />
                  </div>
                </div>
                <ImageCanvas label="Featured Update Image Canvas" compact className="min-h-40" />
              </div>
            </article>
            <div className="grid gap-4 sm:grid-cols-3">
              {updateSections.map((section) => (
                <InfoCard key={section} title={section} canvasLabel={`${section} Image Canvas`} />
              ))}
            </div>
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
