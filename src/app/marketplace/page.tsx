import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { marketplaceCategories, marketplaceProducts } from "@/lib/marketplace-data";

export const metadata: Metadata = { title: "Marketplace" };

const filters = [
  { label: "All", href: "/marketplace", category: undefined },
  ...marketplaceCategories.map((category) => ({ label: category.name, href: `/marketplace?category=${category.slug}`, category: category.slug }))
];

type MarketplacePageProps = { searchParams?: { category?: string } };

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const category = marketplaceCategories.find((item) => item.slug === searchParams?.category)?.slug;
  const products = category ? marketplaceProducts.filter((product) => product.category === category) : marketplaceProducts;

  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Marketplace" eyebrow="De Jadon Group">
          <p>Explore our agricultural products and food packages. Send an enquiry for current availability, quantities and pricing.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 pb-6">
          <nav aria-label="Product categories" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = category === filter.category;
              return <Link key={filter.href} href={filter.href} aria-current={selected ? "page" : undefined} className={`rounded-card px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "bg-orangeAction text-white" : "text-stone-600 hover:bg-orangeAction/5 hover:text-orangeAction"}`}>{filter.label}</Link>;
            })}
          </nav>
          <span className="text-sm text-stone-500">{products.length} {products.length === 1 ? "product" : "products"}</span>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      </PageSection>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <SectionHeader title="How enquiries work" eyebrow="Ordering" />
          <ol className="grid gap-6 sm:grid-cols-3">
            {[
              ["01", "Choose a product", "Browse the catalogue and open a product for more details."],
              ["02", "Send an enquiry", "Tell us the quantity you need and your location."],
              ["03", "Confirm with our team", "We will confirm current availability, pricing and next steps."]
            ].map(([number, title, description]) => (
              <li key={number} className="border-t border-ink/10 pt-5">
                <span className="text-sm font-semibold text-orangeAction">{number}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </PageSection>
      <PageSection tinted>
        <Link href="/businesses/agriculture" className="group flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xl font-semibold text-ink hover:text-orangeAction">
          Learn more about our agriculture business <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </Link>
      </PageSection>
    </SiteLayout>
  );
}
