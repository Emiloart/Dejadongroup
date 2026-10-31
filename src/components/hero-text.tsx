import type { ReactNode } from "react";

export function HeroText({ children }: { children: ReactNode }) {
  return <span className="hero-text-backdrop">{children}</span>;
}
