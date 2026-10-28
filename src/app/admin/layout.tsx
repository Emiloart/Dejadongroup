import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSignIn } from "@/components/admin-sign-in";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin workspace | De Jadon Group",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return isAdminAuthenticated() ? <>{children}</> : <AdminSignIn configured={isAdminConfigured()} />;
}
