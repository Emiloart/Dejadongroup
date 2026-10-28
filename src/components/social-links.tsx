import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Linkedin, MessageCircle, Music2, Youtube } from "lucide-react";
import { socialLinks } from "@/lib/site-data";
import type { SocialPlatform } from "@/types/site";

const icons: Record<SocialPlatform, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Music2,
  whatsapp: MessageCircle,
  youtube: Youtube
};

type SocialLinksProps = {
  className?: string;
  light?: boolean;
};

export function SocialLinks({ className = "", light = false }: SocialLinksProps) {
  const verifiedLinks = socialLinks.filter((link) => /^https:\/\//.test(link.href));

  if (!verifiedLinks.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} aria-label="Official social links">
      {verifiedLinks.map((link) => {
        const Icon = icons[link.platform];
        return (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            title={link.handle ? `${link.label}: ${link.handle}` : link.label}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-card border transition ${
              light ? "border-white/15 text-stone-200 hover:border-orange-200 hover:text-orange-200" : "border-orangeAction/20 text-orangeAction hover:bg-orange-50"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
