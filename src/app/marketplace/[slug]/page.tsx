import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PageSection } from "@/components/page-section";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { getMarketplaceImage } from "@/lib/media-library";
import { getMarketplaceCategoryName, getMarketplaceProduct, getProductInquiryHref, marketplaceProducts } from "@/lib/marketplace-data";

type ProductPageProps = { params: { slug: string } };

export function generateStaticParams() {
  return marketplaceProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getMarketplaceProduct(params.slug);
  return { title: product ? product.name : "Product" };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getMarketplaceProduct(params.slug);
  if (!product) notFound();
  const related = marketplaceProducts.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 2);

  return (
    <SiteLayout>
      <PageSection>
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orangeAction"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to marketplace</Link>
        <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          <ProductMedia name={product.name} src={getMarketplaceImage(product.slug)} priority />
          <div>
            <SectionHeader title={product.name} eyebrow={getMarketplaceCategoryName(product.category)} as="h1">
              <p>{product.summary}</p>
            </SectionHeader>
            <p className="mt-6 max-w-lg leading-7 text-stone-600">Please include the quantity you need and your location when you contact us. Our team will confirm availability, pricing and fulfilment details.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={getProductInquiryHref(product)}>Enquire about {product.name}</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Contact details</ButtonLink>
            </div>
          </div>
        </div>
      </PageSection>
      {related.length > 0 ? (
        <PageSection tinted>
          <SectionHeader title="Related products" />
          <div className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </PageSection>
      ) : null}
    </SiteLayout>
  );
}
