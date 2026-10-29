import { AdminShell } from "@/components/admin-shell";
import { AdminNewsletterManager } from "@/components/admin-newsletter-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNewsletterSubscribers } from "@/lib/newsletter-store";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  if (!isAdminAuthenticated()) return null;
  return <AdminShell section="newsletter"><AdminNewsletterManager initialSubscribers={await getNewsletterSubscribers()} /></AdminShell>;
}
