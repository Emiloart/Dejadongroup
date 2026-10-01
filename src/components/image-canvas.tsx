import { ImageIcon } from "lucide-react";
import type { Accent } from "@/types/site";

type ImageCanvasProps = {
  label: string;
  accent?: Accent;
  compact?: boolean;
  className?: string;
};

export function ImageCanvas({ label, accent = "orange", compact = false, className = "" }: ImageCanvasProps) {
  const tone = accent === "green" ? "bg-agriculture/[0.08]" : "bg-ink/[0.045]";
  const caption = label.replace(/\b(?:Image\s+)?Canvas\b/gi, "").replace(/\s+/g, " ").trim();

  return (
    <div
      className={`flex w-full items-end rounded-card ${tone} ${
        compact ? "aspect-[16/9] min-h-28" : "aspect-[4/3] min-h-56"
      } ${className}`}
    >
      <div className="flex items-center gap-2 p-5 text-stone-500">
        <ImageIcon aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="text-xs leading-5">{caption}</span>
      </div>
    </div>
  );
}
