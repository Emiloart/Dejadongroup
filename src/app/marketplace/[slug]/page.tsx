import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PageSection } from "@/components/page-section";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { getMarketplaceImage } from "@/lib/media-library";
import { formatProductPrice, getMarketplaceCategoryName, getProductInquiryHref } from "@/lib/marketplace-data";
import { getPublishedProduct, getPublishedProducts } from "@/lib/marketplace-store";
import { publicPageMetadata } from "@/lib/seo";

type ProductPageProps = { params: { slug: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getPublishedProduct(params.slug);
  if (!product) notFound();
  return publicPageMetadata(`/marketplace/${encodeURIComponent(product.slug)}`, product.name, product.summary);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getPublishedProduct(params.slug);
  if (!product) notFound();
  const related = (await getPublishedProducts()).filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);
  const availability = product.availability ?? "on-request";
  const availabilityLabel = availability === "in-stock" ? "In stock" : availability === "out-of-stock" ? "Out of stock" : "Available on request";

  return (
    <SiteLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12 lg:px-8 lg:pb-20">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orangeAction"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to marketplace</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:gap-14">
          <ProductMedia name={product.name} alt={product.imageAlt} src={product.image || getMarketplaceImage(product.slug)} sizes="(max-width: 1024px) 100vw, 50vw" priority />
          <div>
            <SectionHeader title={product.name} eyebrow={getMarketplaceCategoryName(product.category)} as="h1">
              <p>{product.summary}</p>
            </SectionHeader>
            <div className="mt-6 border-y border-ink/10 py-5">
              <p className="text-3xl font-semibold text-ink">
                {formatProductPrice(product)}
                {typeof product.price === "number" && product.unit ? <span className="ml-2 text-base font-normal text-stone-500">/ {product.unit}</span> : null}
              </p>
              <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="text-stone-500">Availability</dt>
                  <dd className={`rounded-full px-3 py-1 font-semibold ${availability === "in-stock" ? "bg-agriculture/10 text-agriculture" : "bg-stone-100 text-stone-600"}`}>{availabilityLabel}</dd>
                </div>
                {product.unit ? <div className="flex items-center gap-2"><dt className="text-stone-500">Sold by</dt><dd className="font-medium text-ink">{product.unit}</dd></div> : null}
              </dl>
            </div>
            {product.description?.trim() && product.description.trim() !== product.summary.trim() ? <div className="mt-6">
              <h2 className="text-lg font-semibold text-ink">Product details</h2>
              <p className="mt-3 whitespace-pre-line break-words leading-7 text-stone-600">{product.description}</p>
            </div> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={getProductInquiryHref(product)}>{availability === "out-of-stock" ? "Ask about restocking" : "Enquire about this product"}</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Contact our team</ButtonLink>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-500">{availability === "out-of-stock" ? "This product is currently out of stock. Contact our team to ask when it will be available again." : "Include your quantity and location. Our team will confirm availability, the total price and delivery or collection arrangements."}</p>
          </div>
        </div>
        </div>
      </section>
      {related.length > 0 ? (
        <PageSection>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeader title="You may also like" />
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-orangeAction">All products <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
