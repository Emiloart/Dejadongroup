import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { GalleryImage } from "@/lib/media-library";

const categoryLabels = {
  agriculture: "Agriculture",
  "agro-real-estate": "Agro-Real Estate"
};

type GalleryGridProps = {
  images: GalleryImage[];
  emptyTitle?: string;
};

export function GalleryGrid({ images, emptyTitle = "Photography is being added" }: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="border-y border-ink/10 py-14 text-center sm:py-20">
        <ImageIcon aria-hidden="true" className="mx-auto h-7 w-7 text-orangeAction" strokeWidth={1.5} />
        <h2 className="mt-5 text-2xl font-semibold text-ink">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">Visit again soon to see photographs from De Jadon Group&apos;s work and projects.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <figure key={`${image.category}/${image.filename}`} className="min-w-0">
          <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${image.alt} image`} className="group relative block aspect-[4/3] overflow-hidden rounded-card bg-ink/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orangeAction">
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          </a>
          <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/10 pb-4">
            <span className="font-medium text-ink">{image.alt}</span>
            <span className="text-xs text-stone-500">{categoryLabels[image.category]}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
