import { AdminResourceHistory } from "@/components/admin-resource-history";
import { AdminShell } from "@/components/admin-shell";
import { AdminNewsManager } from "@/components/admin-news-manager";
import { adminPage } from "@/lib/admin-access";
import { getNewsArticles } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const admin = await adminPage("content.read"); if (!admin) return null;
  return <AdminShell section="news"><AdminNewsManager permissions={admin.permissions} initialArticles={await getNewsArticles()} /><AdminResourceHistory resource="news" /></AdminShell>;
}
