import { ImageIcon } from "lucide-react";
import type { Accent } from "@/types/site";

type ImageCanvasProps = {
  label: string;
  accent?: Accent;
  compact?: boolean;
};

export function ImageCanvas({ label, accent = "orange", compact = false }: ImageCanvasProps) {
  const accentClass =
    accent === "green"
      ? "border-agriculture/35 bg-green-50 text-agriculture"
      : "border-orangeAction/35 bg-orange-50 text-orangeAction";

  return (
    <div
      className={`flex items-center justify-center rounded-card border-2 border-dashed ${accentClass} ${
        compact ? "min-h-36" : "min-h-72"
      }`}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <ImageIcon aria-hidden="true" className="h-8 w-8" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}
