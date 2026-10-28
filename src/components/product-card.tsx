import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductMedia } from "@/components/product-media";
import { getMarketplaceImage } from "@/lib/media-library";
import { formatProductPrice, getMarketplaceCategoryName, type MarketplaceProduct } from "@/lib/marketplace-data";

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  const availability = product.availability ?? "on-request";
  return (
    <article className="min-w-0 rounded-card border border-ink/10 bg-white p-3 sm:p-4">
      <Link href={`/marketplace/${product.slug}`} className="group flex h-full flex-col rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orangeAction">
        <ProductMedia name={product.name} alt={product.imageAlt} src={product.image || getMarketplaceImage(product.slug)} />
        <div className="px-1 pb-1 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="font-semibold text-agriculture">{getMarketplaceCategoryName(product.category)}</p>
            <span className={`rounded-full px-2.5 py-1 font-medium ${availability === "in-stock" ? "bg-agriculture/10 text-agriculture" : "bg-stone-100 text-stone-600"}`}>
              {availability === "in-stock" ? "In stock" : availability === "out-of-stock" ? "Out of stock" : "Check availability"}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-ink group-hover:text-orangeAction">{product.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.summary}</p>
        </div>
        <div className="mx-1 mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pb-1 pt-4">
          <p className="text-base font-semibold text-ink">
            {formatProductPrice(product)}
            {typeof product.price === "number" && product.unit ? <span className="ml-1 text-xs font-normal text-stone-500">/ {product.unit}</span> : null}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orangeAction">Details <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span>
        </div>
      </Link>
    </article>
  );
}
