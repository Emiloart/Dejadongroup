import { AdminShell } from "@/components/admin-shell";
import { AdminNewsletterManager } from "@/components/admin-newsletter-manager";
import { adminPage } from "@/lib/admin-access";
import { getNewsletterSubscribers } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const admin = await adminPage("newsletter.read"); if (!admin) return null;
  return <AdminShell section="newsletter"><AdminNewsletterManager initialSubscribers={await getNewsletterSubscribers()} /></AdminShell>;
}
