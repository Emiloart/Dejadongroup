import { SocialIcon } from "@/components/social-icon";
import { socialLinks } from "@/lib/site-data";

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
        return (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            title={link.handle ? `${link.label}: ${link.handle}` : link.label}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-card border transition ${
              light ? "border-white/15 text-stone-200 hover:border-orange-200 hover:text-orange-200" : "border-orangeAction/20 text-orangeAction hover:bg-orange-50"
            }`}
          >
            <SocialIcon platform={link.platform} className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
