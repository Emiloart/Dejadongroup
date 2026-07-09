import { ImageIcon } from "lucide-react";
import type { Accent } from "@/types/site";

type ImageCanvasProps = {
  label: string;
  accent?: Accent;
  compact?: boolean;
  className?: string;
};

export function ImageCanvas({ label, accent = "orange", compact = false, className = "" }: ImageCanvasProps) {
  const accentClass =
    accent === "green"
      ? "border-agriculture/35 text-agriculture"
      : "border-orangeAction/35 text-orangeAction";

  return (
    <div
      className={`image-canvas-pattern flex items-center justify-center rounded-card border-2 border-dashed ${accentClass} ${
        compact ? "min-h-28" : "min-h-56"
      } ${className}`}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <ImageIcon aria-hidden="true" className="h-8 w-8" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}
