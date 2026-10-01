import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
};

export function ButtonLink({ href, children, variant = "solid", className = "", ...props }: ButtonLinkProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-semibold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-orangeAction text-white hover:bg-orange-600"
      : "text-ink hover:bg-orangeAction/5 hover:text-orangeAction";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`} {...props}>
      {children}
      {variant === "outline" ? <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
    </Link>
  );
}
