import { AdminShell } from "@/components/admin-shell";
import { AdminNewsManager } from "@/components/admin-news-manager";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNewsArticles } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  if (!isAdminAuthenticated()) return null;
  return <AdminShell section="news"><AdminNewsManager initialArticles={await getNewsArticles()} /></AdminShell>;
}
