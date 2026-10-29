import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import { PageSection } from "@/components/page-section";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { marketplaceCategories } from "@/lib/marketplace-data";
import { getPublishedProducts } from "@/lib/marketplace-store";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl("/marketplace") },
  title: "Marketplace",
  description: "Browse De Jadon Group products, view prices and availability, and enquire directly with our team."
};

const filters = [
  { label: "All products", href: "/marketplace", category: undefined },
  ...marketplaceCategories.map((category) => ({ label: category.name, href: `/marketplace?category=${category.slug}`, category: category.slug }))
];

type MarketplacePageProps = { searchParams?: { category?: string } };

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const category = marketplaceCategories.find((item) => item.slug === searchParams?.category)?.slug;
  const publishedProducts = await getPublishedProducts();
  const products = category ? publishedProducts.filter((product) => product.category === category) : publishedProducts;

  return (
    <SiteLayout>
      <section className="border-b border-ink/10 bg-warm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-end lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Products from De Jadon Group</p>
            <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">Marketplace</h1>
            <p className="mt-4 max-w-xl leading-7 text-stone-600">Our agricultural range includes fresh and dried fish alongside food packages. Browse the catalogue for product details and availability, then contact our team to arrange your order.</p>
          </div>
          <Link href="/businesses/agriculture" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-agriculture hover:text-orangeAction lg:self-auto">About our agriculture business <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-6 sm:pb-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
          <nav aria-label="Product categories" className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = category === filter.category;
              return <Link key={filter.href} href={filter.href} aria-current={selected ? "page" : undefined} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "bg-agriculture text-white" : "bg-stone-100 text-stone-600 hover:bg-agriculture/10 hover:text-agriculture"}`}>{filter.label}</Link>;
            })}
          </nav>
          <span className="text-sm text-stone-500">{products.length} {products.length === 1 ? "product" : "products"}{category ? ` in ${marketplaceCategories.find((item) => item.slug === category)?.name.toLowerCase()}` : ""}</span>
        </div>
        {products.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div> : <div className="py-16 text-center">
          <Package aria-hidden="true" className="mx-auto h-8 w-8 text-agriculture" strokeWidth={1.5} />
          <h2 className="mt-5 text-2xl font-semibold text-ink">{category ? "No products in this category yet" : "Products are being added"}</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">{category ? "Browse the full catalogue or contact our team about what you need." : "Please check back soon, or contact our team to ask about available products."}</p>
          <Link href={category ? "/marketplace" : "/contact"} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orangeAction">{category ? "View all products" : "Contact our team"} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>}
        </div>
      </section>
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
    </SiteLayout>
  );
}
