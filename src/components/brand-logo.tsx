import Image from "next/image";
import logo from "@/assets/DE JADON LOGO (Green) (1).svg";

type BrandLogoProps = {
  className?: string;
  light?: boolean;
};

export function BrandLogo({ className = "", light = false }: BrandLogoProps) {
  return (
    <Image
      src={logo}
      alt="De Jadon Group"
      width={160}
      height={54}
      unoptimized
      className={`${light ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
