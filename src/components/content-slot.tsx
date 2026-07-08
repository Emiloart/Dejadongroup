import type { Accent } from "@/types/site";

type ContentSlotProps = {
  label: string;
  accent?: Accent;
};

export function ContentSlot({ label, accent = "orange" }: ContentSlotProps) {
  const accentClass =
    accent === "green"
      ? "border-agriculture/25 bg-green-50 text-agriculture"
      : "border-orangeAction/20 bg-warm text-stone-600";

  return (
    <div className={`rounded-card border border-dashed p-5 text-sm font-semibold ${accentClass}`}>
      {label}
    </div>
  );
}
