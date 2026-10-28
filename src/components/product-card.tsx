import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductMedia } from "@/components/product-media";
import { getMarketplaceImage } from "@/lib/media-library";
import { getMarketplaceCategoryName, type MarketplaceProduct } from "@/lib/marketplace-data";

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  return (
    <article className="min-w-0">
      <Link href={`/marketplace/${product.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orangeAction">
        <ProductMedia name={product.name} src={getMarketplaceImage(product.slug)} />
        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-agriculture">{getMarketplaceCategoryName(product.category)}</p>
            <h2 className="mt-2 text-xl font-semibold text-ink group-hover:text-orangeAction">{product.name}</h2>
          </div>
          <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-orangeAction transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
      <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600">{product.summary}</p>
    </article>
  );
}
