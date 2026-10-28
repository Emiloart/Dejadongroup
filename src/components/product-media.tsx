import Image from "next/image";
import { Package } from "lucide-react";

type ProductMediaProps = {
  name: string;
  src: string | null;
  priority?: boolean;
};

export function ProductMedia({ name, src, priority = false }: ProductMediaProps) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card bg-agriculture/[0.08]">
      {src ? (
        <Image src={src} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={priority} className="object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 text-agriculture/65">
          <Package aria-hidden="true" className="h-10 w-10" strokeWidth={1.25} />
          <span className="text-xs font-medium">Image coming soon</span>
        </div>
      )}
    </div>
  );
}
