import type { Accent } from "@/types/site";

type ContentSlotProps = {
  label: string;
  accent?: Accent;
};

export function ContentSlot({ label, accent = "orange" }: ContentSlotProps) {
  const text = label.replace(/(?:\s+(?:Content|Slot))+$/gi, "").trim();

  return (
    <p className={`max-w-prose text-sm leading-7 ${accent === "green" ? "text-agriculture" : "text-stone-600"}`}>
      {text}
    </p>
  );
}
