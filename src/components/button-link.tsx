import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
};

export function ButtonLink({ href, children, variant = "solid", className = "", ...props }: ButtonLinkProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-card px-5 py-3 text-sm font-semibold transition";
  const styles =
    variant === "solid"
      ? "bg-orangeAction text-white hover:bg-orange-600"
      : "border border-orangeAction text-orangeAction hover:bg-orange-50";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </Link>
  );
}
