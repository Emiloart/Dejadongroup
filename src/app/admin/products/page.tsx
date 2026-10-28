import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!isAdminAuthenticated()) return null;
  const products = await getAdminProducts();

  return (
    <AdminShell section="products">
      <AdminProductManager initialProducts={products} />
    </AdminShell>
  );
}
